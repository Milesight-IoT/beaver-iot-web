import React from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useMemoizedFn } from 'ahooks';
import classNames from 'classnames';

import { Modal, type ModalProps, LoadingWrapper } from '@milesight/shared/src/components';
import { useI18n } from '@milesight/shared/src/hooks';

import { type FileValueType } from '@/components';
import { useFormItems } from './useFormItems';
import { type ToiletBuildingProps } from '../../types';
import { useBatchBind } from './useBatchBind';

export interface BatchAddProps {
    buildingTemplate: ToiletBuildingProps;
    uploadFile: FileValueType;
}

/**
 * Batch add Modal
 */
const BatchAddModal: React.FC<ModalProps> = props => {
    const { visible, onCancel, ...restProps } = props;

    const { getIntlText } = useI18n();
    const { control, formState, handleSubmit, reset } = useForm<BatchAddProps>();
    const { formItems } = useFormItems();
    const { handleUploadFile } = useBatchBind();

    const onSubmit: SubmitHandler<BatchAddProps> = async params => {
        /**
         * Upload file
         */
        await handleUploadFile(params?.uploadFile, () => {
            /**
             * Reset form data and close modal
             */
            reset();
            onCancel?.();
        });
    };

    const handleCancel = useMemoizedFn(() => {
        reset();
        onCancel?.();
    });

    return (
        <Modal
            size="lg"
            visible={visible}
            title={getIntlText('dashboard.label.batch_bind_entities')}
            className={classNames({ loading: formState.isSubmitting })}
            onOk={handleSubmit(onSubmit)}
            onCancel={handleCancel}
            {...restProps}
        >
            <LoadingWrapper loading={false}>
                {formItems.map(item => (
                    <Controller<BatchAddProps> {...item} key={item.name} control={control} />
                ))}
            </LoadingWrapper>
        </Modal>
    );
};

export default BatchAddModal;
