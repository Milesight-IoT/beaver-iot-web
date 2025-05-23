import { useEffect } from 'react';
import { create } from 'zustand';
import { useRequest } from 'ahooks';
import { MqttService } from '@/services/mqtt';
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
    const { client, setClient } = useMqttStore();
    const { data } = useRequest(
        async () => {
            if (client) return;
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

            return {
                username: basicInfo?.username,
                password: basicInfo?.password,
                clientId: basicInfo?.client_id,
                url: `ws://${brokerInfo?.host}:${brokerInfo?.ws_port}${brokerInfo?.ws_path}`,
            };
        },
        {
            debounceWait: 300,
            refreshDeps: [client],
        },
    );

    useEffect(() => {
        if (client || !data || Object.values(data).some(item => !item)) return;
        const mqttClient = new MqttService(data);
        setClient(mqttClient);
    }, [data, client, setClient]);

    return client;
};

export default useMqtt;
