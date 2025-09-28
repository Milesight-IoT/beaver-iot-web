import React, { useState, useMemo, useEffect } from 'react';
import { useForm, Controller, type SubmitHandler, type ControllerProps } from 'react-hook-form';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal, ZipIcon, toast, type ModalProps } from '@milesight/shared/src/components';
import { checkRequired } from '@milesight/shared/src/utils/validators';
import { Upload, type FileValueType } from '@/components';

import {
    blueprintAPI,
    awaitWrap,
    isRequestSuccess,
    BlueprintSourceType,
    type BlueprintAPISchema,
} from '@/services/http';
import SourceRadio from './source-radio';

interface EditModalProps extends Omit<ModalProps, 'onOk'> {
    data?: BlueprintAPISchema['getSetting']['response'];
    onError?: (error: Error | null) => void;
    onSuccess?: () => void | Promise<void>;
}

interface FormDataProps {
    source: BlueprintSourceType;
    file: FileValueType;
}

const EditModal: React.FC<EditModalProps> = ({ data, visible, onError, onSuccess, ...props }) => {
    const { getIntlText } = useI18n();

    const [sourceType, setSourceType] = useState<BlueprintSourceType>();
    const { control, handleSubmit, reset, setValue } = useForm<FormDataProps>({
        shouldUnregister: true,
    });
    const formItems = useMemo(() => {
        const result: ControllerProps<FormDataProps>[] = [
            {
                name: 'source',
                rules: {
                    validate: { checkRequired: checkRequired() },
                },
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <SourceRadio
                            required
                            label={getIntlText('common.label.source')}
                            error={!!error}
                            helperText={error?.message}
                            value={value as FormDataProps['source']}
                            onChange={sourceType => {
                                setSourceType(sourceType);
                                onChange(sourceType);
                            }}
                        />
                    );
                },
            },
        ];

        if (sourceType === BlueprintSourceType.UPLOAD) {
            result.push({
                name: 'file',
                rules: {
                    validate: {
                        checkRequired(value) {
                            if (!(value as FileValueType)?.url) {
                                return getIntlText('valid.input.required');
                            }
                        },
                    },
                },
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <Upload
                            required
                            icon={<ZipIcon sx={{ fontSize: 24, mb: 1 }} />}
                            label={getIntlText('common.label.upload_file')}
                            accept={{
                                'application/zip': ['.zip'],
                                'application/x-zip-compressed': ['.zip'],
                            }}
                            maxSize={1024 * 1024 * 5}
                            error={error}
                            helperText={error?.message}
                            value={value as FormDataProps['file']}
                            onChange={onChange}
                        />
                    );
                },
            });
        }

        return result;
    }, [sourceType, getIntlText]);
    const handleOk: SubmitHandler<FormDataProps> = async ({ source, file }) => {
        const [error, resp] = await awaitWrap(
            blueprintAPI.updateSetting({
                source_type: source,
                type: source === BlueprintSourceType.UPLOAD ? 'ZIP' : undefined,
                url: source === BlueprintSourceType.UPLOAD ? file.url : undefined,
            }),
        );

        if (error || !isRequestSuccess(resp)) {
            onError?.(error);
            return;
        }

        toast.success(getIntlText('common.message.operation_success'));
        onSuccess?.();
    };

    useEffect(() => {
        if (!visible) {
            reset();
            setSourceType(undefined);
            return;
        }

        if (data?.current_source_type) {
            setSourceType(data?.current_source_type);
            setValue('source', data?.current_source_type);
        }

        // No need to backfill the file name, as editing the `Local Upload` type requires re-uploading the file
        // if (data?.file_name) setValue('file', { name: data?.file_name, size: 0 });
    }, [data, visible, reset, setValue]);

    return (
        <Modal
            size="lg"
            title={getIntlText('setting.blueprint.edit_modal_title')}
            {...props}
            visible={visible}
            onOk={handleSubmit(handleOk)}
        >
            {formItems.map(props => (
                <Controller<FormDataProps> {...props} key={props.name} control={control} />
            ))}
        </Modal>
    );
};

export default EditModal;
