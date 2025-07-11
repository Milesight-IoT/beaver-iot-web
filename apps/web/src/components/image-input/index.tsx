import React, { useState, useEffect } from 'react';
import { useControllableValue } from 'ahooks';
import cls from 'classnames';
import { TextField, Divider } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { UploadFileIcon, AddLinkIcon, toast } from '@milesight/shared/src/components';
import Upload, { type FileValueType, type Props as UploadProps } from '../upload';
import './style.less';

export interface Props {
    /**
     * Accepted file types
     */
    accept?: UploadProps['accept'];

    /** is read only */
    readOnly?: boolean;

    /** Text value */
    value?: string;

    /** value change callback */
    onChange?: (url: string) => void;
}

type DataType = 'file' | 'url';

/**
 * Image input component
 * @param props
 * @example
 * <ImageInput value={value} onChange={setValue} />
 */
const ImageInput: React.FC<Props> = ({ accept, readOnly, ...props }) => {
    const { getIntlText } = useI18n();
    const [value, setValue] = useControllableValue(props);
    const [file, setFile] = useState<FileValueType | null>();
    const [inputValue, setInputValue] = useState('');
    const [dataType, setDataType] = useState<DataType>('file');

    const handleInputTypeChange = (type: DataType) => {
        setDataType(type);
        switch (type) {
            case 'file':
                setValue(file?.url || '');
                break;
            case 'url':
                setValue(inputValue || '');
                break;
            default:
                break;
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
                        value={file}
                        onChange={data => {
                            if (!data) {
                                setFile(null);
                                setValue('');
                            }
                            const result = !Array.isArray(data) ? data : data[0];

                            setFile(result);
                            if (result?.url) setValue(result.url);
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
