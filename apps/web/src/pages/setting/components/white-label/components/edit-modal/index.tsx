import React from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import cls from 'classnames';
import { useMemoizedFn } from 'ahooks';
import { omit } from 'lodash-es';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal, toast, type ModalProps } from '@milesight/shared/src/components';
import { awaitWrap, isRequestSuccess, credentialsApi, CredentialType } from '@/services/http';
import useFormItems, { type FormDataProps } from './hooks/useFormItems';

interface Props extends Omit<ModalProps, 'onOk'> {
    /** smtp detail */
    data: ObjectToCamelCase<CredentialType> | undefined;
    /** edit successful callback */
    onUpdateSuccess?: () => void;
}

const EditSmtp: React.FC<Props> = ({ visible, data, onCancel, onUpdateSuccess, ...props }) => {
    const { getIntlText } = useI18n();
    const { additionalData } = data || {};

    const { control, formState, handleSubmit, reset } = useForm<FormDataProps>({
        shouldUnregister: true,
        defaultValues: {
            host: additionalData?.host,
            port: additionalData?.port,
            username: additionalData?.username,
            accessSecret: data?.accessSecret,
            encryption: additionalData?.encryption,
        },
    });

    // ---------- Cancel & Submit ----------
    const handleCancel = useMemoizedFn(() => {
        reset();
        onCancel?.();
    });

    const onSubmit: SubmitHandler<FormDataProps> = useMemoizedFn(async (formData, all) => {
        // Edit smtp
        if (data) {
            const [err, resp] = await awaitWrap(
                credentialsApi.editCredential({
                    id: data.id,
                    description: data.description,
                    access_key: data.accessKey,
                    access_secret: formData.accessSecret,
                    additional_data: omit(formData, 'accessSecret'),
                }),
            );

            if (err || !isRequestSuccess(resp)) {
                return;
            }
            onUpdateSuccess?.();
            toast.success(getIntlText('common.message.operation_success'));
        }
    });

    const formItems = useFormItems();

    return (
        <Modal
            size="lg"
            visible={visible}
            title={getIntlText('setting.credentials.edit_smtp')}
            className={cls('ms-credentials-white', { loading: formState.isSubmitting })}
            onOkText={getIntlText('common.button.confirm')}
            onOk={handleSubmit(onSubmit)}
            onCancel={handleCancel}
            {...props}
        >
            {formItems.map(({ shouldRender, ...props }) => {
                return <Controller<FormDataProps> {...props} key={props.name} control={control} />;
            })}
        </Modal>
    );
};

export default EditSmtp;
