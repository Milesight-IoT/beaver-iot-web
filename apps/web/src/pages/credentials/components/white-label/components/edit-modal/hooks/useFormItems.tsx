import { useMemo, useState } from 'react';
import { type ControllerProps, type FieldValues } from 'react-hook-form';
import { TextField } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { Select } from '@milesight/shared/src/components';
import {
    checkRequired,
    checkMaxLength,
    checkPort,
    checkUrl,
    checkLettersAndNum,
    checkRangeLength,
} from '@milesight/shared/src/utils/validators';
import { PasswordInput } from '@/components';
import { CredentialEncryption } from '@/services/http';

type ExtendControllerProps<T extends FieldValues> = ControllerProps<T> & {
    /**
     * To Control whether the current component is rendered
     */
    shouldRender?: (data: Partial<T>) => boolean;
};

/**
 * Form data type
 */
export type FormDataProps = {
    host?: string;
    port?: string;
    username?: string;
    accessSecret: string;
    encryption?: CredentialEncryption | '';
};

/**
 * encryption type
 */
const CredentialEncryptionOptions: {
    label: CredentialEncryption;
    value: CredentialEncryption;
}[] = [
    { label: 'TLS', value: 'TLS' },
    { label: 'STARTTLS', value: 'STARTTLS' },
    { label: 'NONE', value: 'NONE' },
];

const useFormItems = () => {
    const { getIntlText } = useI18n();

    const smtpEncryptionOptions = useMemo(
        () => [
            {
                value: 'NONE',
                label: getIntlText('workflow.email.label_smtp_config_encryption_none'),
            },
            {
                value: 'STARTTLS',
                label: getIntlText('workflow.email.label_smtp_config_encryption_start_tls'),
            },
            {
                value: 'TLS',
                label: getIntlText('workflow.email.label_smtp_config_encryption_tls'),
            },
        ],
        [getIntlText],
    );

    const formItems = useMemo(() => {
        const result: ExtendControllerProps<FormDataProps>[] = [];

        result.push(
            {
                name: 'host',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        checkMaxLength: checkMaxLength({ max: 50 }),
                        checkUrl: checkUrl(),
                    },
                },
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            placeholder={getIntlText('common.placeholder.input')}
                            type="text"
                            autoComplete="off"
                            label={getIntlText('setting.credentials.smtp_addr')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
            {
                name: 'port',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        checkPort: checkPort(),
                    },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            type="text"
                            autoComplete="off"
                            disabled={disabled}
                            placeholder={getIntlText('common.placeholder.input')}
                            label={getIntlText('workflow.email.label_smtp_config_service_port')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
            {
                name: 'encryption',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                    },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <Select
                            required
                            fullWidth
                            error={error}
                            disabled={disabled}
                            placeholder={getIntlText('common.placeholder.input')}
                            label={getIntlText(
                                'workflow.email.label_smtp_config_encryption_method',
                            )}
                            options={smtpEncryptionOptions}
                            formControlProps={{
                                sx: { my: 1.5 },
                            }}
                            value={(value as FormDataProps['encryption']) || ''}
                            onChange={onChange}
                        />
                    );
                },
            },
            {
                name: 'username',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        checkMaxLength: checkMaxLength({ max: 35 }),
                    },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            type="text"
                            autoComplete="off"
                            disabled={disabled}
                            placeholder={getIntlText('common.placeholder.input')}
                            label={getIntlText('user.label.user_name_table_title')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
            {
                name: 'accessSecret',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        checkMaxLength: checkMaxLength({ max: 35 }),
                    },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <PasswordInput
                            required
                            fullWidth
                            autoComplete="off"
                            disabled={disabled}
                            placeholder={getIntlText('common.placeholder.input')}
                            label={getIntlText('common.label.password')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
        );

        return result;
    }, [getIntlText]);

    return formItems;
};

export default useFormItems;
