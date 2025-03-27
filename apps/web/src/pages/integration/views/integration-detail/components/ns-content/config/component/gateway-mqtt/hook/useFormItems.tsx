import { ReactNode, useMemo } from 'react';
import { TextField, type TextFieldProps } from '@mui/material';
import { type ControllerProps } from 'react-hook-form';
import { useI18n } from '@milesight/shared/src/hooks';
import { MqttCredentialBrokerType } from '@/services/http/embeddedNs';
import { CopyTextField, CopyPwdTextField } from '../../copy-text';

/**
 * Form data type
 */
export type FormDataProps = MqttCredentialBrokerType & {
    block_el?: ReactNode;
    broker_address?: string;
};

const useFormItems = () => {
    const { getIntlText } = useI18n();

    const formItems = useMemo(() => {
        const props: Partial<TextFieldProps> = {
            disabled: true,
            type: 'text',
            size: 'small',
            margin: 'dense',
            sx: { my: 1.5 },
        };
        const result: ControllerProps<FormDataProps>[] = [];

        result.push(
            {
                name: 'block_el',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <div className="block_element">
                            <span>{getIntlText('setting.integration.label.user_credential')}</span>
                        </div>
                    );
                },
            },
            {
                name: 'username',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <CopyTextField
                            {...props}
                            label={getIntlText('user.label.user_name_table_title')}
                            value={value}
                        />
                    );
                },
            },
            {
                name: 'password',
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <CopyPwdTextField
                            {...props}
                            label={getIntlText('common.label.password')}
                            value={value}
                        />
                    );
                },
            },
            {
                name: 'block_el',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <div className="block_element">
                            <span>{getIntlText('setting.integration.label.general')}</span>
                        </div>
                    );
                },
            },
            {
                name: 'broker_address',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <CopyTextField
                            {...props}
                            label={getIntlText('setting.integration.label.broken_address')}
                            value={value}
                        />
                    );
                },
            },
            {
                name: 'mqtt_port',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <CopyTextField
                            {...props}
                            label={getIntlText('setting.integration.label.broken_port')}
                            value={value}
                        />
                    );
                },
            },
            {
                name: 'client_id',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <CopyTextField
                            {...props}
                            label={getIntlText('setting.integration.label.client_id')}
                            value={value}
                        />
                    );
                },
            },
            {
                name: 'block_el',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <div className="block_element">
                            <span>{getIntlText('setting.integration.label.topic')}</span>
                        </div>
                    );
                },
            },
            {
                name: 'uplink_data_topic',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <CopyTextField
                            {...props}
                            label={getIntlText('setting.integration.label.uplink_data')}
                            value={value}
                        />
                    );
                },
            },
            {
                name: 'downlink_data_topic',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <CopyTextField
                            {...props}
                            label={getIntlText('setting.integration.label.downlink_data')}
                            value={value}
                        />
                    );
                },
            },
            {
                name: 'request_data_topic',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <CopyTextField
                            {...props}
                            label={getIntlText('setting.integration.label.request_data')}
                            value={value}
                        />
                    );
                },
            },
            {
                name: 'response_data_topic',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <CopyTextField
                            {...props}
                            label={getIntlText('setting.integration.label.response_data')}
                            value={value}
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
