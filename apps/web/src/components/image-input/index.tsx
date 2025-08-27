import React, { useState, useEffect } from 'react';
import { useControllableValue } from 'ahooks';
import cls from 'classnames';
import { TextField, Divider } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { UploadFileIcon, AddLinkIcon, toast } from '@milesight/shared/src/components';
import { API_PREFIX } from '@/services/http';
import Upload, { type FileValueType, type Props as UploadProps } from '../upload';
import './style.less';

export interface Props {
    /**
     * Accepted file types
     */
    accept?: UploadProps['accept'];

    /** is read only */
    readOnly?: boolean;

    /**
     * Whether to upload files automatically
     */
    autoUpload?: UploadProps['autoUpload'];

    /**
     * Temporary resource live minutes
     */
    tempLiveMinutes?: UploadProps['tempLiveMinutes'];

    /** Text value */
    value?: string;

    /** value change callback */
    onChange?: (url: string) => void;
}

type DataType = 'file' | 'url';

// Generate full url for uploading file
const genFullUrl = (path?: string) => {
    if (!path) return '';
    return path.startsWith('http')
        ? path
        : `${location.origin}${API_PREFIX}${path.startsWith('/') ? '' : '/'}${path}`;
};

function fileToBase64(file?: File | null): Promise<string | undefined> {
    if (!file) return Promise.resolve(undefined);

    return new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e: ProgressEvent<FileReader>) => {
            resolve(e.target?.result as string);
        };
    });
}

/**
 * Image input component
 * @param props
 * @example
 * <ImageInput value={value} onChange={setValue} />
 */
const ImageInput: React.FC<Props> = ({
    accept,
    readOnly,
    autoUpload,
    tempLiveMinutes,
    ...props
}) => {
    const { getIntlText } = useI18n();
    const [value, setValue] = useControllableValue(props);
    const [file, setFile] = useState<FileValueType | null>();
    const [inputValue, setInputValue] = useState('');
    const [dataType, setDataType] = useState<DataType>('file');

    const handleInputTypeChange = async (type: DataType) => {
        setDataType(type);
        switch (type) {
            case 'file': {
                const base64 = await fileToBase64(file?.original);
                setValue(base64 || genFullUrl(file?.url));
                break;
            }
            case 'url': {
                setValue(inputValue || '');
                break;
            }
            default: {
                break;
            }
        }
    };

    // Reset value when component unmount
    useEffect(() => {
        return () => {
            setValue('');
            setFile(null);
            setInputValue('');
        };
    }, []);

    return (
        <div className="ms-image-input-root">
            <div className="ms-image-input-main">
                <div className={cls('ms-image-input-text', { 'd-none': dataType !== 'url' })}>
                    <TextField
                        fullWidth
                        type="text"
                        autoComplete="off"
                        slotProps={{
                            input: {
                                readOnly: !!readOnly,
                            },
                        }}
                        placeholder={getIntlText('common.placeholder.input_image_url')}
                        value={inputValue}
                        onChange={e => {
                            const { value } = e.target;
                            setInputValue(value);
                            setValue(value);
                        }}
                    />
                </div>
                <div className={cls('ms-image-input-upload', { 'd-none': dataType !== 'file' })}>
                    <Upload
                        accept={accept}
                        disabled={!!readOnly}
                        autoUpload={autoUpload}
                        tempLiveMinutes={tempLiveMinutes}
                        value={file}
                        onChange={async data => {
                            if (!data) {
                                setFile(null);
                                setValue('');
                            }
                            const file = !Array.isArray(data) ? data : data[0];
                            const base64 = await fileToBase64(file?.original);

                            setFile(file);
                            setValue(base64 || genFullUrl(file?.url));
                        }}
                        onDropRejected={rejections => {
                            const content = rejections[0]?.errors[0]?.message;
                            content && toast.error({ content });
                        }}
                    />
                </div>
            </div>
            <div className="ms-image-input-footer">
                <span
                    className={cls('input-type-btn', { active: dataType === 'file' })}
                    onClick={() => handleInputTypeChange('file')}
                >
                    <UploadFileIcon /> {getIntlText('common.label.upload')}
                </span>
                <Divider orientation="vertical" variant="middle" flexItem />
                <span
                    className={cls('input-type-btn', { active: dataType === 'url' })}
                    onClick={() => handleInputTypeChange('url')}
                >
                    <AddLinkIcon /> {getIntlText('common.label.url')}
                </span>
            </div>
        </div>
    );
};

export default React.memo(ImageInput);
