import React, { useMemo } from 'react';
import { useControllableValue, useMemoizedFn } from 'ahooks';
import { get } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';
import { TextField } from '@mui/material';
import { KeyboardArrowDownIcon, MuiSelect } from '@milesight/shared/src/components';

import { PasswordInput } from '@/components';

import styles from './style.module.less';

export enum SmtpEncryptionMethod {
    NONE = 'NONE',
    STARTTLS = 'STARTTLS',
    TLS = 'TLS',
}

export interface SmtpProps {
    host?: string;
    port?: string;
    username?: string;
    password?: string;
    /**
     *  encryption method
     */
    encryption?: SmtpEncryptionMethod;
}

export interface SmtpFormProps {
    value?: SmtpProps;
    onChange: (val: SmtpProps) => void;
}

export interface ItemProps {
    name: keyof SmtpProps;
    label: string;
    type: 'TextField' | 'Select' | 'Password';
}

export const defaultSmtpValue: SmtpProps = {
    host: '',
    port: '',
    username: '',
    password: '',
    encryption: undefined,
};

/**
 * email SMTP type form items
 */
const SmtpForm: React.FC<SmtpFormProps> = props => {
    const { value, onChange } = props;

    const { getIntlText } = useI18n();

    const [state, setState] = useControllableValue<SmtpProps>({
        value: value || defaultSmtpValue,
        onChange,
    });

    const smtpEncryptionOptions = useMemo(
        () => [
            {
                value: SmtpEncryptionMethod.NONE,
                label: getIntlText('workflow.email.label_smtp_config_encryption_none'),
            },
            {
                value: SmtpEncryptionMethod.STARTTLS,
                label: getIntlText('workflow.email.label_smtp_config_encryption_start_tls'),
            },
            {
                value: SmtpEncryptionMethod.TLS,
                label: getIntlText('workflow.email.label_smtp_config_encryption_tls'),
            },
        ],
        [getIntlText],
    );

    const setValue = useMemoizedFn((name: keyof SmtpProps, value: any) => {
        setState({
            ...state,
            [name]: value,
        });
    });

    const getValue = useMemoizedFn((name: keyof SmtpProps) => {
        return get(state, name, get(defaultSmtpValue, name, ''));
    });

    const renderComponent = (item: ItemProps) => {
        const { name, label, type } = item;

        switch (type) {
            case 'TextField':
                return (
                    <TextField
                        required
                        fullWidth
                        label={label}
                        type="text"
                        value={getValue(name)}
                        onChange={e => {
                            setValue(name, e.target.value);
                        }}
                    />
                );
            case 'Password':
                return (
                    <PasswordInput
                        required
                        fullWidth
                        autoComplete="new-password"
                        label={label}
                        value={getValue(name)}
                        onChange={e => {
                            setValue(name, e.target.value);
                        }}
                    />
                );
            case 'Select':
                return (
                    <MuiSelect
                        formControlProps={{
                            fullWidth: true,
                            required: true,
                            sx: {
                                margin: '8px 0',
                            },
                        }}
                        notched
                        variant="outlined"
                        label="Encryption"
                        options={smtpEncryptionOptions}
                        IconComponent={KeyboardArrowDownIcon}
                        value={getValue(name)}
                        onChange={e => {
                            setValue(name, e.target.value);
                        }}
                    />
                );
            default:
                return null;
        }
    };

    const formItems = useMemo((): ItemProps[] => {
        return [
            {
                label: getIntlText('workflow.email.label_smtp_config_service_host'),
                name: 'host',
                type: 'TextField',
            },
            {
                label: getIntlText('workflow.email.label_smtp_config_service_port'),
                name: 'port',
                type: 'TextField',
            },
            {
                label: getIntlText('workflow.email.label_smtp_config_username'),
                name: 'username',
                type: 'TextField',
            },
            {
                label: getIntlText('workflow.email.label_smtp_config_password'),
                name: 'password',
                type: 'Password',
            },
            {
                label: getIntlText('workflow.email.label_smtp_config_encryption_method'),
                name: 'encryption',
                type: 'Select',
            },
        ];
    }, [getIntlText]);

    return (
        <div className={styles['smtp-form']}>
            {formItems.map(f => (
                <div key={f.name} className={styles.item}>
                    {renderComponent(f)}
                </div>
            ))}
        </div>
    );
};

export default SmtpForm;
