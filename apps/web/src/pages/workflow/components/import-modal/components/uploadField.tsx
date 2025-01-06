import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useI18n } from '@milesight/shared/src/hooks';
import './style.less';
import { AttachFileIcon, DeleteIcon } from '@milesight/shared/src/components';
import { IconButton } from '@mui/material';
import cls from 'classnames';

type FileUploadProps = {
    /** accept filetype */
    accept?: string;
    /** multiple */
    multiple?: boolean;
    /** file list */
    value: File | File[];
    /** field error */
    error?: string;
    /** upload tips */
    uploadTips?: string;
    /** upload Icon */
    uploadIcon?: React.ReactNode;
    /** upload callback */
    onChange?: (files: File[]) => void;
};

const FileUpload: React.FC<FileUploadProps> = ({
    value,
    error,
    accept,
    multiple = false,
    uploadTips,
    uploadIcon,
    onChange,
}) => {
    const [fileList, setFileList] = useState<File[]>([]);
    const [fileDrag, setFileDrag] = useState<boolean>(false);
    const { getIntlText } = useI18n();
    const iconStyle = {
        width: 12,
        height: 12,
        marginRight: '2px',
    };
    const uploadLabel = useMemo(() => {
        if (uploadTips) {
            return uploadTips;
        }
        return getIntlText('workflow.modal.upload_tips');
    }, [uploadTips]);
    useEffect(() => {
        if (!value) {
            setFileList([]);
        } else if (Array.isArray(value)) {
            setFileList(value);
        } else {
            setFileList([value]);
        }
    }, [value]);
    const filterFilesByAccept = (files: File[]): File[] => {
        if (!accept) {
            return files;
        }
        const acceptRules = accept.split(',').map(rule => rule.trim().toLowerCase());
        return files.filter(file => {
            const fileType = file.type.toLowerCase();
            const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
            return acceptRules.some(rule => {
                if (rule.startsWith('.')) {
                    return fileExtension === rule;
                }
                if (rule.endsWith('/*')) {
                    return fileType.startsWith(rule.replace('/*', ''));
                }
                return fileType === rule;
            });
        });
    };

    const handleFiles = (files: FileList) => {
        let fileArray = Array.from(files);
        fileArray = filterFilesByAccept(fileArray);
        if (fileArray.length === 0) {
            return;
        }
        setFileList(prev => {
            if (multiple) {
                return [...prev, ...fileArray];
            }
            return [...fileArray];
        });
        onChange && onChange(fileArray);
    };
    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer.files) {
                handleFiles(e.dataTransfer.files);
            }
        },
        [onChange],
    );
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setFileDrag(true);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setFileDrag(false);
    };
    const handleClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept || '';
        input.multiple = multiple;
        input.onchange = e => {
            const target = e.target as HTMLInputElement;
            if (target.files) {
                handleFiles(target.files);
            }
        };
        input.click();
    };
    const clearFileList = () => {
        setFileList([]);
    };
    const renderFileList = useMemo(() => {
        if (fileList.length > 0) {
            return (
                <ul className="ms-file-list">
                    {fileList.map(file => {
                        return (
                            <li key={`file_${file.name}_${file.lastModified}`}>
                                <span>
                                    <AttachFileIcon sx={iconStyle} />
                                    <span className="ms-file-name">{file.name}</span>
                                </span>
                                <IconButton onClick={clearFileList}>
                                    <DeleteIcon sx={iconStyle} />
                                </IconButton>
                            </li>
                        );
                    })}
                </ul>
            );
        }
        return null;
    }, [fileList]);
    return (
        <div className="ms-import-box">
            <div
                onDrop={handleDrop}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleClick}
                className={cls('ms-import-file', {
                    [`ms-import-error`]: !!error,
                    [`ms-import-drag`]: fileDrag,
                })}
            >
                {uploadIcon || null}
                <p className="ms-file-tip">{uploadLabel}</p>
            </div>
            {error ? <span className="ms-import-error-tip">{error}</span> : null}
            {renderFileList}
        </div>
    );
};

export default FileUpload;
