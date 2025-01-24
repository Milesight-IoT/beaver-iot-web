import { useCallback } from 'react';
import { dayjs, DEFAULT_DATA_TIME_FORMAT } from '../services/time';
import { useSharedGlobalStore } from '../stores';

/**
 * Time-dependent Hook
 *
 * Note: Hook is designed for time-responsive processing. If there are no business requirements related to time zone and time format, the processing logic can be adjusted to a tool function.
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
        /** Dayjs object */
        dayjs,

        /** System time zone */
        timezone,

        /** Update system time zone */
        setTimezone,

        /** Gets the Dayjs object time */
        getTime,

        /** Gets the time after formatting */
        getTimeFormat,
    };
};

export default useTime;
