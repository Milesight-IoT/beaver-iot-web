import { useState, useCallback, useEffect, useRef } from 'react';
import { useRequest, useMemoizedFn } from 'ahooks';
import { Button } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { AddIcon, toast } from '@milesight/shared/src/components';
import {
    MobileTopbar,
    InfiniteScrollList,
    PermissionControlHidden,
    useConfirm,
    type InfiniteScrollListRef,
} from '@/components';
import { PERMISSIONS } from '@/constants';
import {
    deviceAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    type DeviceDetail,
} from '@/services/http';
import {
    AddModal,
    MobileGroupSelect,
    MobileSearchInput,
    MobileDeviceItem,
    type GroupItem,
    type ActionType,
} from './components';
import { FixedGroupEnum } from './constants';
import './style.less';

/**
 * Device item height
 */
const DEVICE_ITEM_HEIGHT = 116;

export default () => {
    const { getIntlText } = useI18n();

    const [group, setGroup] = useState<GroupItem>();
    const [addModalOpen, setAddModalOpen] = useState(false);

    // ---------- Device List ----------
    const deviceListRef = useRef<InfiniteScrollListRef>(null);
    const [pagination, setPagination] = useState({ page: 0, pageSize: 10 });
    const [devicesData, setDevicesData] = useState<{ list: DeviceDetail[]; total: number }>({
        list: [],
        total: 0,
    });
    const { loading, runAsync: getDeviceList } = useRequest(
        async ({
            page,
            pageSize,
            groupId,
        }: {
            page: number;
            pageSize: number;
            keyword?: string;
            groupId?: ApiKey;
        }) => {
            const [error, resp] = await awaitWrap(
                deviceAPI.getList({
                    group_id: groupId === FixedGroupEnum.ALL ? undefined : groupId,
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
    const reloadDeviceList = useCallback(async (groupId?: ApiKey) => {
        setPagination({ page: 0, pageSize: pagination.pageSize });
        setDevicesData({ list: [], total: 0 });

        await getDeviceList({
            groupId,
            page: 1,
            pageSize: pagination.pageSize,
        });
        deviceListRef.current?.scrollTo(0);
    }, []);

    const handleLoadMore = () => {
        getDeviceList({
            groupId: group?.id,
            page: pagination.page + 1,
            pageSize: pagination.pageSize,
        });
    };

    // Init device list
    useEffect(() => {
        reloadDeviceList(group?.id);
    }, [group, reloadDeviceList]);

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

                await reloadDeviceList(group?.id);
                toast.success({
                    key: 'mobile-delete-device',
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

    return (
        <div className="ms-main">
            <div className="ms-view ms-view-device-mobile">
                <div className="ms-view-device-mobile__header">
                    <MobileTopbar
                        title={<MobileGroupSelect value={group} onChange={setGroup} />}
                        slotRight={
                            <PermissionControlHidden permissions={PERMISSIONS.DEVICE_ADD}>
                                <Button
                                    variant="text"
                                    startIcon={<AddIcon />}
                                    onClick={() => setAddModalOpen(true)}
                                >
                                    {getIntlText('common.label.add')}
                                </Button>
                            </PermissionControlHidden>
                        }
                    />
                    <MobileSearchInput
                        onDeleteSuccess={() => {
                            reloadDeviceList(group?.id);
                        }}
                    />
                </div>
                <div className="ms-view-device-mobile__body">
                    <InfiniteScrollList
                        className="mobile-device-list"
                        ref={deviceListRef}
                        data={devicesData.list}
                        itemHeight={DEVICE_ITEM_HEIGHT}
                        loading={loading && pagination.page === 0}
                        loadingMore={loading}
                        isNoMore={devicesData.list.length >= devicesData.total}
                        onLoadMore={handleLoadMore}
                        itemRenderer={itemRenderer}
                    />
                </div>
            </div>
            <AddModal
                visible={addModalOpen}
                onCancel={() => setAddModalOpen(false)}
                onSuccess={async () => {
                    setAddModalOpen(false);
                    reloadDeviceList(group?.id);
                }}
            />
        </div>
    );
};
