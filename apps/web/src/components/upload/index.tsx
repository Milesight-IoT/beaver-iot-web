import React, { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import cls from 'classnames';
import { useRequest, useUpdateEffect } from 'ahooks';
import { FieldError } from 'react-hook-form';
import { Button, IconButton, CircularProgress } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { UploadFileIcon, ImageIcon, DeleteIcon } from '@milesight/shared/src/components';
import { globalAPI, awaitWrap, pLimit, getResponseData, GlobalAPISchema } from '@/services/http';
import Tooltip from '../tooltip';
import useDropzone from './useDropzone';
import { DEFAULT_MIN_SIZE, DEFAULT_MAX_SIZE, DEFAULT_PARALLEL_UPLOADING_FILES } from './constants';
import { getSizeString, SERVER_ERROR, errorIntlKey } from './helper';
import { UseDropzoneProps, FileWithPath, FileError } from './typings';
import './style.less';

const enum UploadStatus {
    Uploading = 'uploading',
    Done = 'done',
    Error = 'error',
    Canceled = 'canceled',
}

export type UploadFile = FileWithPath & {
    /**
     * File Upload status
     */
    status?: UploadStatus;

    /**
     * Upload progress (0 ~ 1)
     */
    progress?: number;

    /**
     * Abort controller for uploading file
     */
    abortController?: AbortController;

    /**
     * Blob data for previewing file
     *
     * Attention: Only available when the file type is image
     */
    preview?: string;

    /**
     * Uploaded file url
     */
    url?: string;
};

export type FileValueType = Pick<UploadFile, 'name' | 'size' | 'path' | 'url' | 'preview'>;

type Props = UseDropzoneProps & {
    // type?: string;

    /**
     * The Basic value for files
     */
    value?: null | FileValueType | FileValueType[];

    /**
     * Form item label
     */
    label?: string;

    /**
     * Whether the form item is required
     */
    required?: boolean;

    /**
     * Form item error message
     */
    error?: FieldError;

    /**
     * Form item helper text
     */
    helperText?: React.ReactNode;

    /**
     * The maximum parallel number of uploading files, default is 5
     */
    parallel?: number;

    /**
     * The style of the upload area
     */
    style?: React.CSSProperties;

    /**
     * The class name of the upload area
     */
    className?: string;

    /**
     * Customize the contents in upload area
     */
    children?: React.ReactNode;

    /**
     * Callback for uploading file
     * @param files Uploaded file(s)
     */
    onChange?: (data: Props['value'], files?: null | UploadFile | UploadFile[]) => void;
};

const getFileJsonValue = (file: UploadFile) => {
    const { name, size, path, url, preview } = file;
    return {
        name,
        size,
        path,
        // lastModified,
        url,
        preview,
    };
};

const Upload: React.FC<Props> = ({
    // type,
    value,
    label,
    error,
    required,
    helperText,
    accept = {
        'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.svg'],
    },
    parallel = DEFAULT_PARALLEL_UPLOADING_FILES,
    minSize = DEFAULT_MIN_SIZE,
    maxSize = DEFAULT_MAX_SIZE,
    multiple,
    style,
    className,
    children,
    onChange,
    ...props
}) => {
    const { getIntlText } = useI18n();
    const { acceptedFiles, fileRejections, getRootProps, getInputProps } = useDropzone({
        ...props,
        accept,
        minSize,
        maxSize,
        multiple,
    });
    const acceptString = useMemo(() => {
        const result: string[] = [];
        Object.values(accept).forEach(exts => {
            result.push(...exts.map(ext => ext.replace(/^\./, '').toUpperCase()));
        });

        return result.join(', ');
    }, [accept]);

    // ---------- Upload files to server ----------
    const [files, setFiles] = useState<UploadFile[]>();
    const [fileError, setFileError] = useState<FileError | null>();
    const { run: uploadFiles } = useRequest(
        async (files: UploadFile[]) => {
            const limit = pLimit<GlobalAPISchema['fileUpload']['response'] | undefined>(parallel);
            const uploadTasks = files.map(file =>
                limit(async () => {
                    const [err, resp] = await awaitWrap(
                        globalAPI.fileUpload(
                            { file },
                            { signal: file.abortController?.signal, $ignoreError: true },
                        ),
                    );

                    if (err) return;

                    // TODO: Replace with real response data
                    return resp.data as unknown as GlobalAPISchema['fileUpload']['response'];
                    // return getResponseData(resp);
                }),
            );

            const result = await Promise.all(uploadTasks);

            setFiles(files => {
                const newFiles = files?.map((file, index) => {
                    const item = result[index];
                    const isCanceled = file.status === UploadStatus.Canceled;
                    return Object.assign(file, {
                        url: item?.location,
                        progress: !isCanceled && item?.location ? 1 : undefined,
                        status: isCanceled
                            ? UploadStatus.Canceled
                            : item?.location
                              ? UploadStatus.Done
                              : UploadStatus.Error,
                        abortController: undefined,
                    });
                });
                return newFiles;
            });
            return result;
        },
        {
            manual: true,
            refreshDeps: [parallel],
        },
    );

    // Set the upload files
    useEffect(() => {
        if (fileRejections?.length) {
            const firstError = fileRejections[0].errors[0];

            setFileError(firstError);
            return;
        }

        setFileError(null);
        if (!acceptedFiles?.length) return;

        const result = acceptedFiles.map(file => {
            const newFile: UploadFile = Object.assign(file, {
                status: UploadStatus.Uploading,
                progress: 0,
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
                abortController: new AbortController(),
            });

            return newFile;
        });

        setFiles(result);
        uploadFiles(result);
    }, [acceptedFiles, fileRejections, uploadFiles]);

    // ---------- Handle uploading status ----------
    const [isUploading, setIsUploading] = useState(false);
    const [isAllDone, setIsAllDone] = useState(false);
    const handleCancel = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setFiles(files => {
            const newFiles = files?.map(file => {
                if (file.status === UploadStatus.Uploading) {
                    file.abortController?.abort();
                    file.status = UploadStatus.Canceled;
                    file.progress = undefined;
                }
                return file;
            });
            return newFiles;
        });
    }, []);
    const handleDelete = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setFiles([]);
    }, []);
    const renderDoneFiles = useCallback(() => {
        const result: React.ReactNode[] = [];
        const [file, ...rest] = files?.filter(file => file.status === UploadStatus.Done) || [];

        if (!file) return result;
        result.push(
            <Fragment key={file.path}>
                <Tooltip autoEllipsis className="name" title={file.url} />
                {`(${getSizeString(file.size)})`}
            </Fragment>,
        );

        if (rest.length) {
            const names = rest
                .map(file => (
                    <Fragment key={file.path}>
                        {`${file.url} (${getSizeString(file.size)})`}
                    </Fragment>
                ))
                .join('\n');

            result.push(
                <Tooltip
                    title={names}
                    slotProps={{
                        tooltip: { className: 'ms-upload-cont-more' },
                    }}
                >
                    <span className="more">+{rest.length}</span>
                </Tooltip>,
            );
        }

        return result;
    }, [files]);

    // Update uploading status
    useEffect(() => {
        // console.log({ files });
        const hasError = error || files?.some(file => file.status === UploadStatus.Error);

        if (hasError) {
            setFileError({
                code: SERVER_ERROR,
                message: helperText || error?.message || getIntlText(errorIntlKey[SERVER_ERROR]),
            });
            setIsUploading(false);
            setIsAllDone(false);
            return;
        }

        const uploading = !!files?.some(file => file.status === UploadStatus.Uploading);
        const isAllDone = !!(
            files?.length && files.every(file => file.status === UploadStatus.Done)
        );

        setFileError(null);
        setIsUploading(uploading);
        setIsAllDone(isAllDone);
    }, [files, error, helperText, getIntlText]);

    // Trigger callback when files change
    useUpdateEffect(() => {
        const resultFiles = multiple ? files : files?.[0];
        let resultValues: Props['value'] = null;

        if (files?.length) {
            if (!multiple) {
                const file = files[0];
                resultValues = getFileJsonValue(file);
            } else {
                resultValues = files?.map(file => {
                    return getFileJsonValue(file);
                });
            }
        }

        onChange?.(resultValues, resultFiles);
    }, [files, multiple, onChange]);

    useEffect(() => {
        if (!value) {
            setFiles(files => {
                if (!files?.length) return files;
                return [];
            });
            return;
        }

        setFiles(files => {
            let values = Array.isArray(value) ? value : [value];
            values = values.map(item => ({ ...item, status: UploadStatus.Done }));

            const isReset = !values.every(item => {
                return files?.some(file => {
                    if (item.url) {
                        return file.url === item.url;
                    }

                    return file.path === item.path && file.size === item.size;
                });
            });

            if (isReset) return values as UploadFile[];
            return files;
        });
    }, [value]);

    return (
        <section className={cls('ms-upload', className, { error: !!fileError })} style={style}>
            {label && (
                <div className="label">
                    {required && <span className="asterisk">*</span>} {label}
                </div>
            )}
            <div {...getRootProps({ className: 'ms-upload-dropzone' })}>
                <input {...getInputProps()} />
                {children ||
                    (isAllDone ? (
                        <div className="ms-upload-cont-uploaded" onClick={e => e.stopPropagation()}>
                            <ImageIcon className="icon" />
                            <div className="hint">{renderDoneFiles()}</div>
                            <IconButton onClick={handleDelete}>
                                <DeleteIcon />
                            </IconButton>
                        </div>
                    ) : isUploading ? (
                        <div
                            className="ms-upload-cont-uploading"
                            onClick={e => e.stopPropagation()}
                        >
                            <CircularProgress className="icon" size={24} />
                            <div className="hint">{getIntlText('common.label.uploading')}...</div>
                            <Button
                                variant="text"
                                color="error"
                                className="btn-cancel"
                                onClick={handleCancel}
                            >
                                {getIntlText('common.button.cancel')}
                            </Button>
                        </div>
                    ) : (
                        <div className="ms-upload-cont-default">
                            <UploadFileIcon className="icon" />
                            <div className="hint">
                                {getIntlText('common.message.click_to_upload_file')}
                            </div>
                            <span className="hint-ext">
                                {acceptString}
                                {` (${getIntlText('common.label.max')} ${getSizeString(maxSize)})`}
                            </span>
                        </div>
                    ))}
            </div>
            {fileError && <div className="helper-text">{fileError.message}</div>}
        </section>
    );
};

Upload.displayName = 'Upload';
export default React.memo(Upload);
