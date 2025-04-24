/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useMemoizedFn } from 'ahooks';
import { Alert, DialogActions, Button } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { DeviceListAppItem, MqttCredentialBrokerType } from '@/services/http/embedded-ns';
import { LoadingButton } from '@milesight/shared/src/components';
import { AddGateWayType, useMqtt } from './hook/useMqtt';
import useFormItems, { type FormDataProps } from './hook/useFormItems';

import './style.less';

interface IProps {
    /** device eui */
    eui: string | undefined;
    /** show tip message */
    showTip?: boolean;
    /** mqtt config */
    mqttConfig?: MqttCredentialBrokerType | null;
    /** credential id */
    credential_id?: string;
    /** back event */
    onBack?: (mqttConfig: MqttCredentialBrokerType) => void;
    /** next event */
    onNext?: (data: MqttValidateResultType) => void;
}

export interface MqttValidateResultType {
    applicationOptions: DeviceListAppItem[];
    mqttConfig: MqttCredentialBrokerType;
}

// gateway mqtt config component
const GatewayMqttInfo: React.FC<IProps> = props => {
    const { eui, showTip = true, credential_id, onBack, onNext } = props;

    const { getIntlText } = useI18n();
    const { testMqttConnect, getDefaultMqttData } = useMqtt();
    const [loading, setLoading] = useState<boolean>(false);
    const [credentialId, setCredentialId] = useState<string>();

    // init mqtt config
    const initDefaultMqttData = async (params: AddGateWayType) => {
        const {
            username,
            password,
            host,
            mqtt_port,
            client_id,
            uplink_data_topic,
            downlink_data_topic,
            request_data_topic,
            response_data_topic,
            credential_id,
        } = (await getDefaultMqttData({ eui: params.eui })) || {};

        setValue('username', username);
        setValue('password', password);
        setValue('broker_address', host || location.hostname);
        setValue('mqtt_port', mqtt_port);
        setValue('client_id', client_id);
        setValue('uplink_data_topic', uplink_data_topic);
        setValue('downlink_data_topic', downlink_data_topic);
        setValue('request_data_topic', request_data_topic);
        setValue('response_data_topic', response_data_topic);

        setCredentialId(credential_id);
    };

    useEffect(() => {
        initDefaultMqttData({
            eui: eui || '',
            credential_id,
        });
    }, []);

    // back step
    const handleBackStep = async () => {
        const mqttConfig = getValues();
        onBack?.(mqttConfig);
    };

    // confirm add gateway
    const handleNextStep: SubmitHandler<FormDataProps> = useMemoizedFn(async (formData, all) => {
        setLoading(true);
        const applicationOptions = await testMqttConnect({
            eui: eui || '',
            credential_id: credentialId,
        });
        setLoading(false);
        if (!applicationOptions) {
            return;
        }
        onNext?.({
            mqttConfig: {
                ...formData,
                credential_id: credentialId,
            },
            applicationOptions,
        });
    });

    // ---------- Render form items ----------
    const { control, handleSubmit, setValue, getValues } = useForm<FormDataProps>({
        shouldUnregister: true,
    });
    const formItems = useFormItems();

    return (
        <div>
            {showTip && (
                <div className="ms-ns-add-modal-tip">
                    <Alert severity="info">
                        <div>{getIntlText('setting.integration.add.credential_tip')}</div>
                    </Alert>
                </div>
            )}
            <div className="ms-view-gateway-info">
                {formItems.map(({ ...props }) => {
                    return (
                        <Controller<FormDataProps> {...props} key={props.name} control={control} />
                    );
                })}
            </div>
            {showTip && (
                <DialogActions>
                    <Button
                        variant="outlined"
                        sx={{ textTransform: 'none' }}
                        onClick={handleBackStep}
                    >
                        {getIntlText('common.button.previous')}
                    </Button>
                    <LoadingButton
                        variant="contained"
                        loading={loading}
                        onClick={handleSubmit(handleNextStep)}
                    >
                        {getIntlText(loading ? 'common.button.loading' : 'common.button.next')}
                    </LoadingButton>
                </DialogActions>
            )}
        </div>
    );
};

export default GatewayMqttInfo;
