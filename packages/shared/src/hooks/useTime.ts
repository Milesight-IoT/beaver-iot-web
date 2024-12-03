import { useCallback } from 'react';
import { dayjs, DEFAULT_DATA_TIME_FORMAT } from '../services/time';
import { useSharedGlobalStore } from '../stores';

/**
 * 时间相关 Hook
 *
 * 注：为预留时间响应式处理故设计为 Hook，若确认无时区及时间格式相关业务需求，可将该处理逻辑调整为工具函数。
 */
const useTime = () => {
    const timezone = useSharedGlobalStore(state => state.timezone);
    const setTimezone = useSharedGlobalStore(state => state.setTimezone);

    const getTime = useCallback(
        (time?: dayjs.ConfigType, keepLocalTime?: boolean) => {
            return dayjs(time).tz(timezone, keepLocalTime);
        },
        [timezone],
    );

    const getTimeFormat = useCallback(
        (
            time?: dayjs.ConfigType,
            formatType: keyof typeof DEFAULT_DATA_TIME_FORMAT = 'fullDateTimeMinuteFormat',
        ) => {
            const format = DEFAULT_DATA_TIME_FORMAT[formatType];
            return dayjs(time).format(format);
        },
        [],
    );

    return {
        /** Dayjs 对象 */
        dayjs,

        /** 系统时区 */
        timezone,

        /** 更新系统时区 */
        setTimezone,

        /** 获取 Dayjs 对象时间 */
        getTime,

        /** 获取格式化后的时间 */
        getTimeFormat,
    };
};

export default useTime;
