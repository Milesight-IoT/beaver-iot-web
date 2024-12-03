import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export { dayjs };

/**
 * 默认日期时间格式
 */
export const DEFAULT_DATA_TIME_FORMAT = {
    /** 周日期格式 */
    weekDateFormat: 'ddd',

    /** 简单日期格式 */
    simpleDateFormat: 'YYYY-MM-DD',

    /** 日期周末格式 */
    fullDateFormat: 'YYYY-MM-DD ddd',

    /** 日期时分格式 */
    fullDateTimeMinuteFormat: 'YYYY-MM-DD HH:mm',

    /** 日期时分秒格式 */
    fullDateTimeSecondFormat: 'YYYY-MM-DD HH:mm:ss',

    /** 日期周时分格式 */
    fullDateWeekTimeMinute: 'YYYY-MM-DD ddd HH:mm',

    /** 月日周时分格式 */
    monthDayWeekTimeMinute: 'MM-DD ddd HH:mm',

    /** 月日时分格式 */
    monthDayTimeMinute: 'MM-DD HH:mm',

    /** 时分格式 */
    timeMinuteFormat: 'HH:mm',

    /** 时分秒格式 */
    timeSecondFormat: 'HH:mm:ss',
} as const;

/**
 * 获取当前设备时区
 */
export const getTimezone = () => {
    return dayjs.tz.guess();
};

/**
 * 变更默认时区
 * @param timezone 时区
 */
export const changeTimezone = (timezone: string) => {
    dayjs.tz.setDefault(timezone);
};

/**
 * 日期时间格式化
 * @param time 时间对象
 * @param format 格式
 */
export const format = (
    time: dayjs.ConfigType = dayjs(),
    format = DEFAULT_DATA_TIME_FORMAT.fullDateTimeSecondFormat,
) => {
    return dayjs(time).format(format);
};
