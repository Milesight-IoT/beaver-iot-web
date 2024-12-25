import type { ISubscribe } from '@milesight/shared/src/utils/event-emitter';
import { EVENT_TYPE } from './constant';

export type CallbackType = (...args: any[]) => void;
export interface IEventEmitter extends ISubscribe {
    callbacks: CallbackType[];
}

export interface WsEvent {
    event_type: EVENT_TYPE.EXCHANGE;
    payload: {
        entity_key: string[];
    };
}
