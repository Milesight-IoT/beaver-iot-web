import React, { useEffect } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useMemoizedFn } from 'ahooks';
import classNames from 'classnames';
import { Grid2 as Grid, Alert } from '@mui/material';

import { useI18n } from '@milesight/shared/src/hooks';
import { Modal, type ModalProps, InfoIcon } from '@milesight/shared/src/components';

import { useFormItems } from './hooks';

export type OperateModalType = 'add' | 'edit';

export interface OperateTagProps {
    name: string;
    color: string;
    description?: string;
}

interface Props extends Omit<ModalProps, 'onOk'> {
    operateType: OperateModalType;
    /** on form submit */
    onFormSubmit: (data: OperateTagProps, callback: () => void) => Promise<void>;
    data?: OperateTagProps;
    onSuccess?: (operateType: OperateModalType) => void;
}

/**
 * operate user Modal
 */
const OperateUserModal: React.FC<Props> = props => {
    const { visible, onCancel, onFormSubmit, data, operateType, onSuccess, ...restProps } = props;

    const { getIntlText } = useI18n();

    const { control, formState, handleSubmit, reset, setValue } = useForm<OperateTagProps>();
    const { formItems } = useFormItems();

    const onSubmit: SubmitHandler<OperateTagProps> = async params => {
        await onFormSubmit(params, () => {
            reset();
            onSuccess?.(operateType);
        });
    };

    const handleCancel = useMemoizedFn(() => {
        reset();
        onCancel?.();
    });

    /**
     * initial form value
     */
    useEffect(() => {
        if (operateType !== 'edit') {
            return;
        }

        Object.entries(data || {}).forEach(([k, v]) => {
            setValue(k as keyof OperateTagProps, v);
        });
    }, [data, setValue, operateType]);

    return (
        <Modal
            size="lg"
            visible={visible}
            className={classNames({ loading: formState.isSubmitting })}
            onOk={handleSubmit(onSubmit)}
            onOkText={getIntlText('common.button.save')}
            onCancel={handleCancel}
            {...restProps}
        >
            {operateType === 'edit' && (
                <Alert
                    icon={<InfoIcon />}
                    severity="info"
                    sx={{
                        '.MuiAlert-message': {
                            color: 'var(--text-color-primary)',
                        },
                        margin: '0 0 16px',
                    }}
                >
                    {getIntlText('tag.tip.edit_tag_info')}
                </Alert>
            )}

            <Grid container spacing={1}>
                {formItems.map(({ wrapCol, ...restItem }) => (
                    <Grid key={restItem.name} size={wrapCol}>
                        <Controller<OperateTagProps> {...restItem} control={control} />
                    </Grid>
                ))}
            </Grid>
        </Modal>
    );
};

export default OperateUserModal;
