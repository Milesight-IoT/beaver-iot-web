import { useEffect } from 'react';
import { create } from 'zustand';
import { useRequest } from 'ahooks';
import { useUserStore } from '@/stores';
import { MqttService, MQTT_STATUS, MQTT_EVENT_TYPE, BATCH_PUSH_TIME } from '@/services/mqtt';
import { credentialsApi, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';

const useMqttStore = create<{
    client: MqttService | null;
    setClient: (client: MqttService | null) => void;
}>(set => ({
    client: null,
    setClient: client => set({ client }),
}));

/**
 * Get MQTT client
 */
const useMqtt = () => {
    const userInfo = useUserStore(state => state.userInfo);
    const { client, setClient } = useMqttStore();
    const { data } = useRequest(
        async () => {
            if (client || !userInfo?.user_id) return;
            const [err, resp] = await awaitWrap(
                Promise.all([
                    credentialsApi.getMqttCredential(),
                    credentialsApi.getMqttBrokerInfo(),
                ]),
            );
            const [basicResp, brokerResp] = resp || [];

            if (err || !isRequestSuccess(basicResp) || !isRequestSuccess(brokerResp)) {
                return;
            }
            const basicInfo = getResponseData(basicResp);
            const brokerInfo = getResponseData(brokerResp);
            const isHttps = window.location.protocol === 'https:';
            const protocol = isHttps ? 'wss' : 'ws';
            const host = brokerInfo?.host || location.hostname;
            const port = isHttps
                ? brokerInfo?.wss_port || brokerInfo?.ws_port || location.port
                : brokerInfo?.ws_port || location.port;

            return {
                username: basicInfo?.username,
                password: basicInfo?.password,
                clientId: basicInfo?.client_id,
                url: `${protocol}://${host}:${port}${brokerInfo?.ws_path}`,
            };
        },
        {
            debounceWait: 300,
            refreshDeps: [client, userInfo],
        },
    );

    useEffect(() => {
        if (client || !data || Object.values(data).some(item => !item)) return;
        const mqttClient = new MqttService(data);
        setClient(mqttClient);
    }, [data, client, setClient]);

    return {
        status: client?.status || MQTT_STATUS.DISCONNECTED,
        client,
    };
};

export { MQTT_STATUS, MQTT_EVENT_TYPE, BATCH_PUSH_TIME };
export default useMqtt;
