import React from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useMemoizedFn } from 'ahooks';
import classNames from 'classnames';

import {
    Modal,
    type ModalProps,
    CheckCircleIcon,
    CancelIcon,
    FileDownloadOutlinedIcon,
    LoadingWrapper,
} from '@milesight/shared/src/components';
import { useI18n } from '@milesight/shared/src/hooks';

import { type FileValueType } from '@/components';
import { useFormItems } from './useFormItems';
import { type ToiletBuildingProps } from '../../types';
import { useBatchBind } from './useBatchBind';
import { type MarkerExtraInfoProps } from '../../plugins/occupancy-marker/control-panel';

export interface BatchAddProps {
    buildingTemplate: ToiletBuildingProps;
    uploadFile: FileValueType;
}

export interface BatchAddModalProps extends Omit<ModalProps, 'onOk'> {
    setValue: (v: React.SetStateAction<MarkerExtraInfoProps[]>, ...args: any[]) => void;
}

/**
 * Batch add Modal
 */
const BatchAddModal: React.FC<BatchAddModalProps> = props => {
    const { visible, onCancel, setValue, ...restProps } = props;

    const { getIntlText } = useI18n();
    const { control, formState, handleSubmit, reset } = useForm<BatchAddProps>();
    const { formItems } = useFormItems();
    const {
        handleUploadFile,
        parseResult,
        currentStatus,
        handleDownloadErrorFile,
        setDownloading,
        downloading,
    } = useBatchBind(setValue);

    const onSubmit: SubmitHandler<BatchAddProps> = async params => {
        if (currentStatus === 'completed') {
            reset();
            onCancel?.();
            return;
        }

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

    const renderBody = () => {
        if (currentStatus === 'before') {
            return formItems.map(item => (
                <Controller<BatchAddProps> {...item} key={item.name} control={control} />
            ));
        }

        const { success_data: successData, failed_data: failedData } = parseResult?.data || {};
        return (
            <div className="batch-bind-result">
                <div className="success-item">
                    <CheckCircleIcon color="success" />
                    <div className="success-count">
                        {getIntlText('dashboard.tip.batch_bind_entities_success', {
                            1: successData?.count || 0,
                        })}
                    </div>
                </div>
                <div className="failed-item">
                    <CancelIcon color="error" />
                    <div className="failed-count">
                        <div>
                            {getIntlText('dashboard.tip.batch_bind_entities_failed', {
                                1: failedData?.count || 0,
                            })}
                        </div>
                        <LoadingWrapper size={20} loading={downloading}>
                            <div
                                className="download-wrapper"
                                onClick={() => {
                                    setDownloading(true);
                                    handleDownloadErrorFile();
                                }}
                            >
                                <FileDownloadOutlinedIcon color="inherit" />
                                <div key="download-text" className="download-text">
                                    {getIntlText('common.button.download')}
                                </div>
                            </div>
                        </LoadingWrapper>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Modal
            size="lg"
            visible={visible}
            title={getIntlText('dashboard.label.batch_bind_entities')}
            className={classNames({ loading: formState.isSubmitting })}
            onOk={handleSubmit(onSubmit)}
            onCancel={handleCancel}
            cancelButtonProps={{
                style: {
                    display: currentStatus === 'completed' ? 'none' : undefined,
                },
            }}
            sx={{
                '& .batch-bind-result': {
                    display: 'flex',
                    flexDirection: 'column',
                    fontSize: '14px',
                    lineHeight: '22px',
                    color: 'var(--text-color-primary)',
                    '.success-item': {
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: 1,
                        '.success-count': {
                            marginLeft: 1,
                        },
                    },
                    '.failed-item': {
                        display: 'flex',
                        alignItems: 'center',
                        '.failed-count': {
                            display: 'flex',
                            marginLeft: 1,
                            '.download-wrapper': {
                                display: 'flex',
                                marginLeft: 1,
                                cursor: 'pointer',
                                color: 'var(--primary-color-base)',
                                '.download-text': {
                                    marginLeft: 0.5,
                                },
                            },
                        },
                    },
                },
            }}
            {...restProps}
        >
            {renderBody()}
        </Modal>
    );
};

export default BatchAddModal;
