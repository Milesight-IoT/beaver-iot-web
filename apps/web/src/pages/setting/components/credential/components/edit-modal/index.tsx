import React from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import cls from 'classnames';
import { useMemoizedFn } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal, type ModalProps } from '@milesight/shared/src/components';
import { CredentialType } from '@/services/http';
import useFormItems, { FormDataProps } from './hooks/useFormItems';

interface Props extends Omit<ModalProps, 'onOk'> {
    /** mqtt | http detail */
    data: ObjectToCamelCase<CredentialType> | undefined;
    /** credential type */
    type: 'http' | 'mqtt';
    /** title */
    title: string;
    /** edit success event */
    onUpdateSuccess: (
        originData: ObjectToCamelCase<CredentialType> | undefined,
        formData: FormDataProps,
    ) => void;
}

/** credential update */
const EditCredential: React.FC<Props> = ({
    visible,
    data,
    type,
    title,
    onCancel,
    onUpdateSuccess,
    ...props
}) => {
    const { getIntlText } = useI18n();

    const { control, formState, handleSubmit, reset } = useForm<FormDataProps>({
        shouldUnregister: true,
        defaultValues: {
            username: data?.accessKey?.split('@')?.[0] || '',
            accessSecret: data?.accessSecret || '',
        },
    });

    // ---------- Cancel & Submit ----------
    const handleCancel = useMemoizedFn(() => {
        reset();
        onCancel?.();
    });

    const onSubmit: SubmitHandler<FormDataProps> = useMemoizedFn(async formData => {
        onUpdateSuccess(data, {
            ...formData,
            username: data?.accessKey || '',
        });
    });

    const formItems = useFormItems({
        tenantId: data?.tenantId || '',
        type,
    });

    return (
        <Modal
            size="lg"
            visible={visible}
            title={title}
            className={cls('ms-credential-edit', { loading: formState.isSubmitting })}
            onOkText={getIntlText('common.button.confirm')}
            onOk={handleSubmit(onSubmit)}
            onCancel={handleCancel}
            {...props}
        >
            {formItems.map(({ shouldRender, ...props }) => {
                return (
                    <Controller<FormDataProps>
                        {...props}
                        key={props.name}
                        control={control}
                        disabled={props.name === 'username'}
                    />
                );
            })}
        </Modal>
    );
};

export default EditCredential;
