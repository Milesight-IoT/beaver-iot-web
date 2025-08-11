import React, { useEffect } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useMemoizedFn } from 'ahooks';
import classNames from 'classnames';

import { Modal, type ModalProps, LoadingWrapper } from '@milesight/shared/src/components';
import { useI18n } from '@milesight/shared/src/hooks';

import { type AddDeviceProps } from '@/services/http';
import { type FileValueType } from '@/components';
import { useFormItems, useAddProgress } from './hooks';
import { BatchAddProgress } from './components';

export type BatchAddStatus = 'beforeAdd' | 'adding';

export interface BatchAddProps {
    integration: ApiKey;
    uploadFile: FileValueType;
}

interface Props extends Omit<ModalProps, 'onOk'> {
    /**
     * Batch add status
     */
    status?: BatchAddStatus;
    /**
     * Data to be added list
     */
    addList?: AddDeviceProps[];
    /**
     * current integration
     */
    integration?: ApiKey;
    /**
     * Device template file
     */
    templateFile?: File;
    /**
     * Add List Real Row ids
     */
    rowIds?: ApiKey[];
    /** on form submit */
    onFormSubmit: (params: BatchAddProps, callback: () => void) => Promise<void>;
}

/**
 * Batch add Modal
 */
const BatchAddModal: React.FC<Props> = props => {
    const {
        visible,
        onCancel,
        status = 'beforeAdd',
        onFormSubmit,
        addList,
        integration,
        templateFile,
        rowIds,
        ...restProps
    } = props;

    const { getIntlText } = useI18n();
    const { control, formState, handleSubmit, reset, setValue } = useForm<BatchAddProps>();
    const { firstIntegrationId, loadingIntegrations, formItems } = useFormItems();
    const {
        addLoopEnd,
        handleAddLoopEnd,
        interruptAddList,
        interrupt,
        addCompleted,
        isInterrupting,
        handleAddCompleted,
    } = useAddProgress();

    useEffect(() => {
        setValue('integration', firstIntegrationId || '');
    }, [setValue, firstIntegrationId]);

    const onSubmit: SubmitHandler<BatchAddProps> = async params => {
        await onFormSubmit(params, () => {
            reset();
        });
    };

    const handleCancel = useMemoizedFn(() => {
        if (status === 'adding') {
            interruptAddList();
            return;
        }

        reset();
        onCancel?.();
    });

    const renderBody = () => {
        if (status === 'beforeAdd') {
            return (
                <LoadingWrapper loading={loadingIntegrations}>
                    {formItems.map(item => (
                        <Controller<BatchAddProps> {...item} key={item.name} control={control} />
                    ))}
                </LoadingWrapper>
            );
        }

        if (status === 'adding') {
            return (
                <BatchAddProgress
                    addList={addList}
                    integration={integration}
                    templateFile={templateFile}
                    rowIds={rowIds}
                    interrupt={interrupt}
                    onLoopEnd={handleAddLoopEnd}
                    onCompleted={handleAddCompleted}
                />
            );
        }

        return null;
    };

    return (
        <Modal
            size="lg"
            visible={visible}
            title={getIntlText('device.label.batch_add_device')}
            className={classNames({ loading: formState.isSubmitting })}
            onOk={handleSubmit(onSubmit)}
            okButtonProps={{
                disabled: loadingIntegrations || (status === 'adding' && !addCompleted),
            }}
            onCancel={handleCancel}
            onCancelText={
                status === 'adding'
                    ? getIntlText('common.button.interrupt')
                    : getIntlText('common.button.cancel')
            }
            cancelButtonProps={{
                color: status === 'adding' ? 'error' : undefined,
                style:
                    status === 'adding' && (addLoopEnd || addCompleted)
                        ? { display: 'none' }
                        : undefined,
                loading: isInterrupting && !addCompleted,
            }}
            {...restProps}
        >
            {renderBody()}
        </Modal>
    );
};

export default BatchAddModal;
