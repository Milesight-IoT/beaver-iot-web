import type { ISubscribe } from '@milesight/shared/src/utils/event-emitter';
import { MQTT_EVENT_TYPE } from './constant';

export type CallbackType = (...args: any[]) => void;

export interface IEventEmitter extends ISubscribe {
    callbacks: CallbackType[];
}

type ExchangeMessage = {
    event_type: MQTT_EVENT_TYPE.EXCHANGE;
    payload: {
        entity_ids: string[];
    };
};

// type HeartbeatMessage = {
//     event_type: MQTT_EVENT_TYPE.HEARTBEAT;
//     payload: string;
// };

export type MqttMessageData = ExchangeMessage;
