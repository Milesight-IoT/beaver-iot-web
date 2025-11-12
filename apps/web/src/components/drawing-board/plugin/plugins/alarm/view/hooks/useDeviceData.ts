import { useState, useRef, useMemo } from 'react';
import { useMemoizedFn, useRequest } from 'ahooks';
import { isEmpty } from 'lodash-es';

import { objectToCamelCase } from '@milesight/shared/src/utils/tools';

import { type DateRangePickerValueType } from '@/components';
import { type DeviceSelectData } from '@/components/drawing-board/plugin/components';
import {
    deviceAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    type AlarmSearchCondition,
} from '@/services/http';

export function useDeviceData({
    paginationModel,
    filteredInfo,
    devices,
    searchConditionRef,
}: {
    paginationModel?: {
        page: number;
        pageSize: number;
    };
    filteredInfo?: Record<string, any>;
    devices?: DeviceSelectData[];
    searchConditionRef: React.MutableRefObject<AlarmSearchCondition | null>;
}) {
    const [keyword, setKeyword] = useState('');
    const [selectTime, setSelectTime] = useState<number>(1440 * 60 * 1000);
    const [modalVisible, setModalVisible] = useState(false);
    const [timeRange, setTimeRange] = useState<DateRangePickerValueType | null>(null);
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    const alarmRef = useRef<HTMLDivElement>(null);
    const alarmContainerWidth = alarmRef.current?.getBoundingClientRect()?.width || 0;

    /**
     * Get alarm status from filtered info
     */
    const alarmStatus = useMemo(() => {
        const status = filteredInfo?.alarmStatus;

        if (!Array.isArray(status) || isEmpty(status)) {
            return;
        }

        const statusList = (status as string[]).map(s => !!Number(s));
        if (statusList?.length === 2) {
            return;
        }

        return statusList[0];
    }, [filteredInfo]);

    const {
        loading,
        data,
        run: getDeviceAlarmData,
    } = useRequest(
        async () => {
            if (!Array.isArray(devices) || isEmpty(devices)) {
                return;
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
            if (!dateTimeRange) {
                return;
            }

            const searchCondition: AlarmSearchCondition = {
                keyword,
                device_ids: devices.map(d => d.id),
                start_timestamp: dateTimeRange[0],
                end_timestamp: dateTimeRange[1],
                alarm_status: alarmStatus,
            };
            searchConditionRef.current = searchCondition;

            const [error, resp] = await awaitWrap(
                deviceAPI.getDeviceAlarms({
                    ...searchCondition,
                    page_number: (paginationModel?.page || 0) + 1,
                    page_size: paginationModel?.pageSize || 10,
                }),
            );

            const data = getResponseData(resp);

            if (error || !isRequestSuccess(resp) || !data) {
                return;
            }

            return objectToCamelCase(data);
        },
        {
            debounceWait: 300,
            refreshDeps: [devices, keyword, alarmStatus, selectTime, timeRange, paginationModel],
        },
    );

    const handleCustomTimeRange = useMemoizedFn(() => {
        /**
         * Custom time range, set select time to -1
         */
        setSelectTime(-1);
    });

    const onSelectTime = useMemoizedFn((time: number) => {
        if (time !== -1 && timeRange) {
            setTimeRange(null);
        }
    });

    return {
        keyword,
        setKeyword,
        alarmRef,
        alarmContainerWidth,
        selectTime,
        setSelectTime,
        modalVisible,
        setModalVisible,
        timeRange,
        setTimeRange,
        /**
         * Custom time range
         */
        handleCustomTimeRange,
        onSelectTime,
        data,
        showMobileSearch,
        setShowMobileSearch,
        loading,
        getDeviceAlarmData,
    };
}
