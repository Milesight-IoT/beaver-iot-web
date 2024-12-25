import { client, attachAPI, API_PREFIX } from './client';

/**
 * 会议详情定义
 */
export interface MeetingDetail {
    /** ID */
    id: ApiKey;
    /** model */
    model: string;
    /** 类型 */
    type: string;
    /** 输入 */
    input: string;
    /** 额外数据（通常为后端使用，前端暂不开放） */
    // additional_data?: Record<string, any>;
}

/**
 * 会议相关接口定义
 */
export interface MeetingAPISchema extends APISchema {
    /** 保存会议 */
    addMeeting: {
        request: {
            id?: string;
            /** 预约名称 */
            subject?: string;
            /** 会议室id */
            meeting?: string;
            key?: string;
            /** 开始时间 */
            first?: string;
            /** 结束时间 */
            last?: string;
            time?: string;
            date?: string;
            /** 集成新增会议需要的额外信息 */
            param_entities: Record<string, any>;
        };
        response: unknown;
    };


    /** 删除会议 */
    deleteMeeting: {
        request: {
            meeting_id: string;
        };
        response: unknown;
    };
}

/**
 * 会议相关 API 服务
 */
export default attachAPI<MeetingAPISchema>(client, {
    apis: {
        addMeeting: `POST ${API_PREFIX}/meeting`,
        deleteMeeting: `POST ${API_PREFIX}/meeting/delete`,
    },
});
