import React, { useEffect } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useMemoizedFn } from 'ahooks';
import classNames from 'classnames';
import { Grid2 as Grid } from '@mui/material';
import { pick } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';
import { Modal, type ModalProps } from '@milesight/shared/src/components';

import { useFormItems } from './hooks';

export type OperateModalType = 'add' | 'edit';

export interface OperateDashboardProps {
    name: string;
    cover?: string;
    description?: string;
}

interface Props extends Omit<ModalProps, 'onOk'> {
    operateType: OperateModalType;
    /** on form submit */
    onFormSubmit: (data: OperateDashboardProps, callback: () => void) => Promise<void>;
    data?: OperateDashboardProps;
    onSuccess?: (operateType: OperateModalType) => void;
}

/**
 * operate dashboard Modal
 */
const OperateModal: React.FC<Props> = props => {
    const { visible, onCancel, onFormSubmit, data, operateType, onSuccess, ...restProps } = props;

    const { getIntlText } = useI18n();

    const { control, formState, handleSubmit, reset, setValue } = useForm<OperateDashboardProps>();
    const { formItems } = useFormItems();

    const onSubmit: SubmitHandler<OperateDashboardProps> = async params => {
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

        const newData = pick(data, ['name', 'description']);
        Object.entries(newData || {}).forEach(([k, v]) => {
            setValue(k as keyof OperateDashboardProps, v);
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
            <Grid container spacing={2}>
                {formItems.map(({ wrapCol, ...restItem }) => (
                    <Grid key={restItem.name} size={wrapCol}>
                        <Controller<OperateDashboardProps> {...restItem} control={control} />
                    </Grid>
                ))}
            </Grid>
        </Modal>
    );
};

export default OperateModal;
