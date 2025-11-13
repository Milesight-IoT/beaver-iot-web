import { isNil } from 'lodash-es';
import { type DateRangePickerValueType } from '@/components';

export const getAlarmTimeRange = (
    selectTime?: number,
    timeRange?: DateRangePickerValueType | null,
) => {
    if (isNil(selectTime)) {
        return null;
    }

    let dateTimeRange: number[] | null = null;
    /**
     * If select time is not -1, then use select time as time range
     * If time range is not null, then use time range as time range
     */
    if (selectTime !== -1) {
        dateTimeRange = [Date.now() - selectTime, Date.now()];
    } else if (timeRange?.start && timeRange?.end) {
        dateTimeRange = [
            timeRange.start.startOf('day').valueOf(),
            timeRange.end.endOf('day').valueOf(),
        ];
    }

    return dateTimeRange;
};
