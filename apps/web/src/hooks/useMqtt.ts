import { unstable_batchedUpdates as unstableBatchedUpdates } from 'react-dom';
import { create } from 'zustand';
import { useRequest } from 'ahooks';
import eventEmitter from '@milesight/shared/src/utils/event-emitter';
import { useUserStore } from '@/stores';
import {
    MqttService,
    MQTT_STATUS,
    MQTT_EVENT_TYPE,
    BATCH_PUSH_TIME,
    TOPIC_MQTT_STATUS_CHANGE,
} from '@/services/mqtt';
import { credentialsApi, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';

const useMqttStore = create<{
    status: MQTT_STATUS;
    client: MqttService | null;

    setStatus: (status: MQTT_STATUS) => void;
    setClient: (client: MqttService | null) => void;
}>(set => ({
    status: MQTT_STATUS.DISCONNECTED,
    client: null,
    setStatus: status => set({ status }),
    setClient: client => set({ client }),
}));

eventEmitter.subscribe(TOPIC_MQTT_STATUS_CHANGE, status => {
    /**
     * Calling actions outside a React event handler in pre React 18
     * https://docs.pmnd.rs/zustand/guides/event-handler-in-pre-react-18
     */
    unstableBatchedUpdates(() => {
        useMqttStore.setState({ status });
    });
});

/**
 * Get MQTT client
 */
const useMqtt = () => {
    const userInfo = useUserStore(state => state.userInfo);
    const { status, client, setStatus, setClient } = useMqttStore();

    useRequest(
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
            onSuccess(data) {
                if (client || !data || Object.values(data).some(item => !item)) return;

                const debug = window.sessionStorage.getItem('vconsole') === 'true';
                const mqttClient = new MqttService({ debug, ...data });

                setStatus(mqttClient.status);
                setClient(mqttClient);
            },
        },
    );

    return {
        status,
        client,
    };
};

export { MQTT_STATUS, MQTT_EVENT_TYPE, BATCH_PUSH_TIME };
export default useMqtt;
