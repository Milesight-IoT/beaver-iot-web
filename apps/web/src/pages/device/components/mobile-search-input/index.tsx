import React, { useState, useRef, useCallback } from 'react';
import { useRequest, useMemoizedFn } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { toast } from '@milesight/shared/src/components';
import {
    useConfirm,
    Empty,
    InfiniteScrollList,
    MobileSearchPanel,
    type InfiniteScrollListRef,
} from '@/components';
import {
    deviceAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    type DeviceDetail,
} from '@/services/http';
import MobileDeviceItem, { DEVICE_ITEM_HEIGHT, type ActionType } from '../mobile-device-item';

interface Props {
    onDeleteSuccess?: (device: DeviceDetail) => void;
}

const MobileSearchInput: React.FC<Props> = ({ onDeleteSuccess }) => {
    const { getIntlText } = useI18n();

    // ---------- Device List ----------
    const searchListRef = useRef<InfiniteScrollListRef>(null);
    const [pagination, setPagination] = useState({ page: 0, pageSize: 10 });
    const [devicesData, setDevicesData] = useState<{
        list: DeviceDetail[];
        total: number;
    }>({
        list: [],
        total: 0,
    });
    const { loading, runAsync: getDeviceList } = useRequest(
        async ({
            page,
            pageSize,
            keyword,
        }: {
            page: number;
            pageSize: number;
            keyword?: string;
        }) => {
            const [error, resp] = await awaitWrap(
                deviceAPI.getList({
                    name: keyword,
                    page_number: page,
                    page_size: pageSize,
                }),
            );

            if (error || !isRequestSuccess(resp)) return;
            const data = getResponseData(resp);

            setPagination({ page, pageSize });
            setDevicesData(d => {
                const list =
                    page === 1 ? data?.content || [] : [...d.list, ...(data?.content || [])];
                return {
                    list,
                    total: data?.total || 0,
                };
            });
        },
        {
            manual: true,
            debounceWait: 300,
        },
    );

    // ---------- Device Item Renderer ----------
    const confirm = useConfirm();
    const handleAction = useMemoizedFn((type: ActionType, device: DeviceDetail) => {
        if (type !== 'delete') return;

        confirm({
            title: getIntlText('common.label.delete'),
            description: getIntlText('device.message.delete_tip'),
            onConfirm: async () => {
                const [error, resp] = await awaitWrap(
                    deviceAPI.deleteDevices({
                        device_id_list: [device.id],
                    }),
                );

                if (error || !isRequestSuccess(resp)) return;

                setDevicesData({ list: [], total: 0 });
                setPagination({ page: 0, pageSize: pagination.pageSize });
                await getDeviceList({
                    page: 1,
                    pageSize: pagination.pageSize,
                    keyword,
                });
                searchListRef.current?.scrollTo(0);

                onDeleteSuccess?.(device);
                toast.success({
                    key: 'mobile-search-delete-device',
                    content: getIntlText('common.message.delete_success'),
                });
            },
        });
    });
    const itemRenderer = useCallback(
        (item: DeviceDetail) => (
            <MobileDeviceItem key={item.id} data={item} onAction={handleAction} />
        ),
        [handleAction],
    );

    // ---------- Search Logic ----------
    const [keyword, setKeyword] = useState<string | undefined>('');
    const [searchActive, setSearchActive] = useState(false);

    const handleKeywordChange = (value?: string) => {
        setKeyword(value || '');
        setPagination({ page: 0, pageSize: pagination.pageSize });
        setDevicesData({ list: [], total: 0 });
        searchListRef.current?.scrollTo(0);
        if (!value || !searchActive) return;

        getDeviceList({
            page: 1,
            pageSize: pagination.pageSize,
            keyword: value,
        });
    };

    const handleLoadMore = () => {
        getDeviceList({
            page: pagination.page + 1,
            pageSize: pagination.pageSize,
            keyword,
        });
    };

    return (
        <MobileSearchPanel
            value={keyword}
            onChange={handleKeywordChange}
            active={searchActive}
            onActiveChange={setSearchActive}
        >
            <InfiniteScrollList
                ref={searchListRef}
                data={devicesData.list}
                itemHeight={DEVICE_ITEM_HEIGHT}
                loading={loading && pagination.page === 0}
                loadingMore={loading}
                isNoMore={devicesData.list.length >= devicesData.total}
                onLoadMore={handleLoadMore}
                itemRenderer={itemRenderer}
                emptyRenderer={<Empty text={getIntlText('device.search.placeholder_empty')} />}
            />
        </MobileSearchPanel>
    );
};

export default MobileSearchInput;
