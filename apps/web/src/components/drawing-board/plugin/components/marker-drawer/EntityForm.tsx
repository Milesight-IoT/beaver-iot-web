import React, { useEffect } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useMemoizedFn } from 'ahooks';
import { Button } from '@mui/material';

import { useI18n } from '@milesight/shared/src/hooks';

import { useFormItems } from './useFormItems';

export interface OperateProps {
    occupiedEntity: any;
    statusEntity: any;
    notification: string;
}

interface Props {
    data?: OperateProps;
    onSuccess?: () => void;
}

/**
 * Toilet Entity Form
 */
const EntityForm: React.FC<Props> = props => {
    const { data, onSuccess } = props;

    const { getIntlText } = useI18n();

    const { control, formState, handleSubmit, reset, setValue } = useForm<OperateProps>();
    const { formItems } = useFormItems();

    const onSubmit: SubmitHandler<OperateProps> = async params => {
        console.log('params ? ', params);

        reset();
        onSuccess?.();
    };

    const handleCancel = useMemoizedFn(() => {
        reset();
    });

    /**
     * initial form value
     */
    useEffect(() => {
        Object.entries(data || {}).forEach(([k, v]) => {
            setValue(k as keyof OperateProps, v);
        });
    }, [data, setValue]);

    return (
        <>
            <div className="body">
                {formItems.map(item => (
                    <Controller<OperateProps> {...item} key={item.name} control={control} />
                ))}
            </div>

            <div className="save-button">
                <Button fullWidth variant="contained" onClick={handleSubmit(onSubmit)}>
                    {getIntlText('common.button.save')}
                </Button>
            </div>
        </>
    );
};

export default EntityForm;
