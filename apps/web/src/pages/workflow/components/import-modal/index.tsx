import React from 'react';
import { useMemoizedFn } from 'ahooks';
import cls from 'classnames';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal, type ModalProps } from '@milesight/shared/src/components';
import useImportFormItems, { type FormDataProps } from './hook/useImportFormItems';

interface Props extends Omit<ModalProps, 'onOk'> {
    /** upload callback */
    onUpload?: (params: FormDataProps) => Promise<void> | void;
}

/**
 * workflow import modal
 */
const ImportModal: React.FC<Props> = ({ visible, onCancel, onUpload, ...props }) => {
    const { getIntlText } = useI18n();
    const formItems = useImportFormItems();

    // ---------- forms processing ----------
    const { control, formState, handleSubmit, reset } = useForm<FormDataProps>();

    const onSubmit: SubmitHandler<FormDataProps> = async ({ ...params }) => {
        if (onUpload) {
            await onUpload(params);
        }
        // Clear the form data upon confirmation.
        reset();
    };

    const handleCancel = useMemoizedFn(() => {
        reset();
        onCancel && onCancel();
    });

    return (
        <Modal
            visible={visible}
            title={getIntlText('workflow.button.label_import_from_dsl')}
            className={cls({ loading: formState.isSubmitting })}
            onOk={handleSubmit(onSubmit)}
            onCancel={handleCancel}
            sx={{ '& .MuiDialog-paper': { width: 600 } }}
            {...props}
        >
            {formItems.map(props => (
                <Controller<FormDataProps> {...props} key={props.name} control={control} />
            ))}
        </Modal>
    );
};

export default ImportModal;
