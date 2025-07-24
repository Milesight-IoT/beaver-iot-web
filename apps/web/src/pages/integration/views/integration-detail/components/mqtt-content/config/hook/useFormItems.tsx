import { useState, useMemo, useCallback } from 'react';
import { type ControllerProps } from 'react-hook-form';
import { type TextFieldProps } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { MqttBrokerInfoType } from '@/services/http';
import { CopyTextField } from '@/components';

export type FormDataProps = Omit<MqttBrokerInfoType, 'topic_prefix'>;

const useFormItems = () => {
    const { getIntlText } = useI18n();
    const [showSecret, setShowSecret] = useState(false);
    const handleClickShowSecret = useCallback(() => setShowSecret(show => !show), []);

    const formItems = useMemo(() => {
        const commTextProps: Partial<TextFieldProps> = {
            required: true,
            fullWidth: true,
            disabled: true,
        };

        const items: ControllerProps<FormDataProps>[] = [
            {
                name: 'server',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <CopyTextField
                            {...commTextProps}
                            label={getIntlText('setting.integration.mqtt_server_url')}
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
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <CopyTextField
                            {...commTextProps}
                            autoComplete="new-password"
                            label={getIntlText('setting.integration.mqtt_broker_port')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
            {
                name: 'username',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <CopyTextField
                            {...commTextProps}
                            required={false}
                            autoComplete="new-password"
                            label={getIntlText('common.label.username')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
            {
                name: 'password',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <CopyTextField
                            {...commTextProps}
                            required={false}
                            type="password"
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
        ];

        return items;
    }, [showSecret, getIntlText, handleClickShowSecret]);

    return formItems;
};

export default useFormItems;
