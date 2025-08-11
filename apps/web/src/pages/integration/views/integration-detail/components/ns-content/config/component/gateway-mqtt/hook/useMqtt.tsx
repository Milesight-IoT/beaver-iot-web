import { useI18n } from '@milesight/shared/src/hooks';
import { useMemoizedFn } from 'ahooks';
import { toast } from '@milesight/shared/src/components';
import { DeviceListAppItem, MqttCredentialBrokerType } from '@/services/http/embedded-ns';
import { awaitWrap, getResponseData, embeddedNSApi } from '@/services/http';

export interface AddGateWayType {
    eui: string;
    credential_id?: string;
}

// mqtt hook
export const useMqtt = () => {
    const { getIntlText } = useI18n();

    // get default mqtt
    const getDefaultMqttData = useMemoizedFn(
        async (params: AddGateWayType): Promise<MqttCredentialBrokerType | null> => {
            // get credential info
            const [, credentialResp] = await awaitWrap(embeddedNSApi.getCredential(params));
            const [, brokerResp] = await awaitWrap(embeddedNSApi.getMqttBrokerInfo());
            let brokerInfo = getResponseData(brokerResp);
            if (!brokerInfo?.host) {
                try {
                    // use location hostname
                    brokerInfo = {
                        ...brokerInfo,
                        host: location.hostname,
                    };
                } catch (error) {
                    console.error(error, 'parse url fail');
                }
            }
            return {
                ...(brokerResp ? brokerInfo : {}),
                ...(credentialResp ? getResponseData(credentialResp) : {}),
            };
        },
    );

    // test mqtt connection
    const testMqttConnect = useMemoizedFn(
        async (params: AddGateWayType): Promise<DeviceListAppItem[] | undefined> => {
            const [error, resp] = await awaitWrap(embeddedNSApi.checkMqttConnection(params));
            if (error) {
                toast.error({ content: getIntlText('setting.integration.message.test_mqtt_fail') });
                return undefined;
            }
            const deviceApplications = getResponseData(resp);
            return deviceApplications?.app_result;
        },
    );

    return {
        getDefaultMqttData,
        testMqttConnect,
    };
};
