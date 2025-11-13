import { useState, useRef, useContext } from 'react';
import { useMemoizedFn, useRequest, useDebounceEffect } from 'ahooks';
import { isEmpty } from 'lodash-es';

import { objectToCamelCase } from '@milesight/shared/src/utils/tools';

import { type InfiniteScrollListRef } from '@/components';
import {
    deviceAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    type AlarmSearchCondition,
} from '@/services/http';
import { AlarmContext } from '../context';
import { getAlarmTimeRange } from '../utils';
import { type TableRowDataType } from './useColumns';

export const useMobileData = () => {
    const listRef = useRef<InfiniteScrollListRef>(null);
    const [keyword, setKeyword] = useState('');
    const [pagination, setPagination] = useState({ page: 0, pageSize: 10 });
    const [data, setData] = useState<{ list: TableRowDataType[]; total: number }>({
        list: [],
        total: 0,
    });
    const { devices, selectTime, timeRange, showMobileSearch } = useContext(AlarmContext) || {};

    const { loading, runAsync: getAlarmList } = useRequest(
        async (props?: { keyword?: string; page?: number; pageSize?: number }) => {
            const { keyword = '', page = 0, pageSize = 10 } = props || {};

            if (!Array.isArray(devices) || isEmpty(devices)) {
                return;
            }

            const dateTimeRange = getAlarmTimeRange(selectTime, timeRange);
            if (!dateTimeRange) {
                return;
            }

            const searchCondition: AlarmSearchCondition = {
                keyword,
                device_ids: devices.map(d => d.id),
                start_timestamp: dateTimeRange[0],
                end_timestamp: dateTimeRange[1],
            };
            const [error, resp] = await awaitWrap(
                deviceAPI.getDeviceAlarms({
                    ...searchCondition,
                    page_number: page,
                    page_size: pageSize,
                }),
            );

            const data = getResponseData(resp);
            if (error || !isRequestSuccess(resp) || !data) {
                return;
            }

            const newData = objectToCamelCase(data);
            setPagination({ page, pageSize });
            setData(d => {
                const list =
                    page === 1 ? newData?.content || [] : [...d.list, ...(newData?.content || [])];

                return {
                    list,
                    total: newData?.total || 0,
                };
            });
        },
        {
            manual: true,
            debounceWait: 300,
        },
    );

    const reloadList = useMemoizedFn(async () => {
        setPagination({ page: 0, pageSize: pagination.pageSize });
        setData({ list: [], total: 0 });

        await getAlarmList({
            page: 1,
            pageSize: pagination.pageSize,
            keyword,
        });
        listRef.current?.scrollTo(0);
    });

    const handleKeywordChange = (value?: string) => {
        setKeyword?.(value || '');
        setPagination({ page: 0, pageSize: pagination.pageSize });
        setData({ list: [], total: 0 });
        listRef.current?.scrollTo(0);
        if (!value || !showMobileSearch) return;

        getAlarmList({
            page: 1,
            pageSize: pagination.pageSize,
            keyword: value,
        });
    };

    const handleLoadMore = () => {
        getAlarmList({
            page: pagination.page + 1,
            pageSize: pagination.pageSize,
            keyword,
        });
    };

    // Update list
    useDebounceEffect(
        () => {
            reloadList();
        },
        [reloadList, devices, selectTime, timeRange],
        { wait: 300 },
    );

    return {
        loading,
        data,
        listRef,
        pagination,
        keyword,
        reloadList,
        handleKeywordChange,
        handleLoadMore,
    };
};
