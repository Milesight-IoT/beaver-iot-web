import React, { useEffect, useMemo } from 'react';
import cls from 'classnames';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal, type ModalProps } from '@milesight/shared/src/components';
import useWorkflowFormItems, { type FormDataProps } from './hook/useWorkflowFormItems';

export interface Props extends Omit<ModalProps, 'onOk'> {
    /** confirm callback */
    onConfirm?: (params: FormDataProps) => Promise<void> | void;

    /** When data is not empty, it is in edit mode */
    data?: FormDataProps;
}

/**
 * workflow add/edit modal
 */
const EditModal: React.FC<Props> = ({ visible, data, onConfirm, ...props }) => {
    const { getIntlText } = useI18n();

    // ---------- forms processing ----------
    const { control, formState, handleSubmit, setValue, reset } = useForm<FormDataProps>();
    const formItems = useWorkflowFormItems();

    const isEditMode = !!data;
    const modalTitle = useMemo(() => {
        return !isEditMode
            ? getIntlText('workflow.modal.add_workflow_modal')
            : getIntlText('workflow.modal.edit_workflow_modal');
    }, [getIntlText, isEditMode]);

    const onSubmit: SubmitHandler<FormDataProps> = async ({ ...params }) => {
        if (onConfirm) {
            await onConfirm(params);
        }
    };

    useEffect(() => {
        if (!visible || !data) {
            setTimeout(reset, 200);
            return;
        }

        Object.entries(data).forEach(([key, value]) => {
            setValue(key as keyof FormDataProps, value);
        });
    }, [data, visible, reset, setValue]);

    return (
        <Modal
            size="lg"
            visible={visible}
            title={modalTitle}
            className={cls({ loading: formState.isSubmitting })}
            onOk={handleSubmit(onSubmit)}
            {...props}
        >
            {formItems.map(props => (
                <Controller<FormDataProps> {...props} key={props.name} control={control} />
            ))}
        </Modal>
    );
};

export default EditModal;
