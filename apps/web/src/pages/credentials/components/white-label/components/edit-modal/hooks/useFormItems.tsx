import { useMemo, useState } from 'react';
import { type ControllerProps, type FieldValues } from 'react-hook-form';
import { TextField, IconButton } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { Select, VisibilityIcon, VisibilityOffIcon } from '@milesight/shared/src/components';
import {
    checkRequired,
    checkMaxLength,
    checkPort,
    checkUrl,
    checkLettersAndNum,
    checkRangeLength,
} from '@milesight/shared/src/utils/validators';
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
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const formItems = useMemo(() => {
        const result: ExtendControllerProps<FormDataProps>[] = [];

        result.push(
            {
                name: 'host',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        checkUrl: checkUrl(),
                    },
                },
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            placeholder={getIntlText('common.label.please_enter')}
                            type="text"
                            autoComplete="off"
                            label={getIntlText('setting.credentials.label.smtp_addr')}
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
                            placeholder={getIntlText('common.label.please_enter')}
                            label={getIntlText('setting.credentials.label.smtp_port')}
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
                            placeholder={getIntlText('common.label.please_enter')}
                            label={getIntlText('setting.credentials.label.smtp_encryption')}
                            options={CredentialEncryptionOptions}
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
                        checkMaxLength: checkMaxLength({ max: 25 }),
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
                            placeholder={getIntlText('common.label.please_enter')}
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
                        checkLettersAndNum: checkLettersAndNum(),
                        checkRangeLength: checkRangeLength({ min: 8, max: 32 }),
                    },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="off"
                            disabled={disabled}
                            placeholder={getIntlText('common.label.please_enter')}
                            label={getIntlText('common.label.password')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                            sx={{ mr: 0.1 }}
                                        >
                                            {showPassword ? (
                                                <VisibilityIcon />
                                            ) : (
                                                <VisibilityOffIcon />
                                            )}
                                        </IconButton>
                                    ),
                                },
                            }}
                        />
                    );
                },
            },
        );

        return result;
    }, [getIntlText, showPassword]);

    return formItems;
};

export default useFormItems;
