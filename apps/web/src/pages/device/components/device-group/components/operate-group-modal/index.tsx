import React, { useMemo, useEffect } from 'react';
import { useForm, Controller, type SubmitHandler, type ControllerProps } from 'react-hook-form';
import { useMemoizedFn } from 'ahooks';
import { TextField } from '@mui/material';
import classNames from 'classnames';

import { Modal, type ModalProps } from '@milesight/shared/src/components';
import { checkRequired } from '@milesight/shared/src/utils/validators';
import { useI18n } from '@milesight/shared/src/hooks';

export interface OperateGroupProps {
    name: string;
}

interface Props extends Omit<ModalProps, 'onOk'> {
    data?: string;
    /** on form submit */
    onFormSubmit: (params: OperateGroupProps, callback: () => void) => Promise<void>;
}

/**
 * operate group Modal
 */
const OperateGroupModal: React.FC<Props> = props => {
    const { visible, onCancel, onFormSubmit, data, ...restProps } = props;

    const { getIntlText } = useI18n();
    const { control, formState, handleSubmit, reset, setValue } = useForm<OperateGroupProps>();

    const formItems: ControllerProps<OperateGroupProps>[] = useMemo(() => {
        return [
            {
                name: 'name',
                rules: {
                    maxLength: {
                        value: 127,
                        message: getIntlText('valid.input.max_length', {
                            1: 127,
                        }),
                    },
                    validate: {
                        checkRequired: checkRequired(),
                    },
                },
                defaultValue: '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            type="text"
                            label={getIntlText('common.label.name')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                            onBlur={event => {
                                const newValue = event?.target?.value;
                                onChange(typeof newValue === 'string' ? newValue.trim() : newValue);
                            }}
                        />
                    );
                },
            },
        ];
    }, [getIntlText]);

    const onSubmit: SubmitHandler<OperateGroupProps> = async params => {
        await onFormSubmit(params, () => {
            reset();
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
        if (!visible) return;

        setValue('name', data || '');
    }, [data, visible, setValue]);

    return (
        <Modal
            size="lg"
            visible={visible}
            title={getIntlText('common.label.add')}
            className={classNames({ loading: formState.isSubmitting })}
            onOk={handleSubmit(onSubmit)}
            onCancel={handleCancel}
            {...restProps}
        >
            {formItems.map(item => (
                <Controller<OperateGroupProps> {...item} key={item.name} control={control} />
            ))}
        </Modal>
    );
};

export default OperateGroupModal;
