import React, { useMemo, useEffect } from 'react';
import { useForm, Controller, type SubmitHandler, type ControllerProps } from 'react-hook-form';
import { useMemoizedFn } from 'ahooks';
import { TextField } from '@mui/material';
import classNames from 'classnames';

import { Modal, type ModalProps } from '@milesight/shared/src/components';
import {
    passwordChecker,
    checkRequired,
    emailCheckers,
} from '@milesight/shared/src/utils/validators';
import { type TValidator } from '@milesight/shared/src/utils/validators/typings';
import { useI18n } from '@milesight/shared/src/hooks';

import { PasswordInput } from '@/components';

export type OperateModalType = 'add' | 'edit' | 'resetPassword';

interface Props extends Omit<ModalProps, 'onOk'> {
    operateType: OperateModalType;
    /** on form submit */
    onFormSubmit: (data: OperateUserProps, callback: () => void) => Promise<void>;
    data?: OperateUserProps;
    onSuccess?: (operateType: OperateModalType) => void;
}

export interface OperateUserProps {
    nickname?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

/**
 * operate user Modal
 */
const OperateUserModal: React.FC<Props> = props => {
    const { visible, onCancel, onFormSubmit, data, operateType, onSuccess, ...restProps } = props;

    const { getIntlText } = useI18n();
    const { control, formState, handleSubmit, reset, setValue } = useForm<OperateUserProps>();

    const formItems: ControllerProps<OperateUserProps>[] = useMemo(() => {
        const baseItems: ControllerProps<OperateUserProps>[] = [
            {
                name: 'nickname',
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
                            label={getIntlText('user.label.user_name_table_title')}
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
            {
                name: 'email',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        ...(emailCheckers() || {}),
                    } as Record<string, ReturnType<TValidator>>,
                },
                defaultValue: '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            type="text"
                            label={getIntlText('common.label.email')}
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

        const passwordItems: ControllerProps<OperateUserProps>[] = [
            {
                name: 'password',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        passwordChecker: passwordChecker().checkPassword,
                    },
                },
                defaultValue: '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <PasswordInput
                            required
                            fullWidth
                            autoComplete="new-password"
                            label={getIntlText('common.label.password')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
            {
                name: 'confirmPassword',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        passwordChecker: passwordChecker().checkPassword,
                        confirmPasswordChecker: (newConfirmPassword, formValues) => {
                            const { password } = formValues;

                            if (newConfirmPassword && password && newConfirmPassword !== password) {
                                return getIntlText('valid.input.password.diff');
                            }

                            return Promise.resolve(true);
                        },
                    },
                },
                defaultValue: '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <PasswordInput
                            required
                            fullWidth
                            autoComplete="new-password"
                            label={getIntlText('common.label.confirm_password')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
        ];

        /**
         * edit mode forms
         */
        if (operateType === 'edit') {
            return baseItems;
        }

        /**
         * reset password forms
         */
        if (operateType === 'resetPassword') {
            return passwordItems;
        }

        /**
         * add mode forms
         */
        return [...baseItems, ...passwordItems];
    }, [getIntlText, operateType]);

    const onSubmit: SubmitHandler<OperateUserProps> = async params => {
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
        if (visible) {
            const { nickname = '', email = '' } = data || {};

            setValue('nickname', nickname);
            setValue('email', email);
        }
    }, [data, visible, setValue]);

    const renderModal = () => {
        if (visible) {
            return (
                <Modal
                    visible={visible}
                    className={classNames({ loading: formState.isSubmitting })}
                    onOk={handleSubmit(onSubmit)}
                    onCancel={handleCancel}
                    {...restProps}
                >
                    {formItems.map(item => (
                        <Controller<OperateUserProps> {...item} key={item.name} control={control} />
                    ))}
                </Modal>
            );
        }

        return null;
    };

    return renderModal();
};

export default OperateUserModal;
