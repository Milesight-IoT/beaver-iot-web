import { useMemo, useState } from 'react';
import { Stack, IconButton } from '@mui/material';
import { useMemoizedFn } from 'ahooks';
import { get, isNil } from 'lodash-es';

import { useI18n, useTime } from '@milesight/shared/src/hooks';
import {
    CheckCircleOutlineIcon,
    NearMeOutlinedIcon,
    LoadingWrapper,
} from '@milesight/shared/src/components';

import { Tooltip, type ColumnType } from '@/components';
import { toSixDecimals } from '@/components/drawing-board/plugin/utils';
import { type EntityAPISchema, type DeviceAlarmDetail } from '@/services/http';

export type TableRowDataType = ObjectToCamelCase<DeviceAlarmDetail>;

export interface UseColumnsProps {
    /**
     * Is preview mode
     */
    isPreview?: boolean;
    /**
     * Current devices all entities status
     */
    entitiesStatus?: EntityAPISchema['getEntitiesStatus']['response'];
}

const useColumns = <T extends TableRowDataType>({ entitiesStatus }: UseColumnsProps) => {
    const { getIntlText } = useI18n();
    const { getTimeFormat } = useTime();

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

    const columns: ColumnType<T>[] = useMemo(() => {
        return [
            {
                field: 'alarmStatus',
                headerName: getIntlText('device.label.device_status'),
                flex: 1,
                minWidth: 120,
                ellipsis: true,
                renderCell({ value }) {
                    return value ? '已认领' : '未认领';
                },
            },
            {
                field: 'alarmContent',
                headerName: getIntlText('common.label.content'),
                ellipsis: true,
                flex: 1,
                minWidth: 240,
            },
            {
                field: 'alarmTime',
                headerName: getIntlText('common.label.time'),
                flex: 1,
                minWidth: 138,
                ellipsis: true,
                renderCell({ value }) {
                    return getTimeFormat(value, 'fullDateTimeMinuteFormat');
                },
            },
            {
                field: 'position',
                headerName: getIntlText('common.label.position'),
                ellipsis: true,
                flex: 1,
                minWidth: 178,
                renderCell({ row }) {
                    return `${toSixDecimals(row?.latitude)}, ${toSixDecimals(row?.longitude)}`;
                },
            },
            {
                field: '$operation',
                headerName: getIntlText('common.label.operation'),
                display: 'flex',
                width: 100,
                align: 'left',
                headerAlign: 'left',
                fixed: 'right',
                renderCell({ row }) {
                    return (
                        <Stack
                            direction="row"
                            spacing="4px"
                            sx={{ height: '100%', alignItems: 'center', justifyContent: 'end' }}
                        >
                            <LoadingWrapper size={20} loading={false}>
                                <Tooltip title={getIntlText('common.tip.click_to_claim')}>
                                    <IconButton
                                        sx={{
                                            width: 30,
                                            height: 30,
                                            color: 'text.secondary',
                                        }}
                                        onClick={() => console.log('click to claim')}
                                    >
                                        <CheckCircleOutlineIcon sx={{ width: 20, height: 20 }} />
                                    </IconButton>
                                </Tooltip>
                            </LoadingWrapper>
                            <Tooltip title={getIntlText('dashboard.tip.navigate_here')}>
                                <IconButton
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        color: 'text.secondary',
                                    }}
                                    onClick={() => {
                                        console.log('ok');
                                    }}
                                >
                                    <NearMeOutlinedIcon sx={{ width: 20, height: 20 }} />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    );
                },
            },
        ];
    }, [getIntlText, getTimeFormat]);

    return {
        columns,
        paginationModel,
        setPaginationModel,
    };
};

export default useColumns;

function generateApiKey(length = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateRandomAddress(): string {
    const prefixes = ['北京市', '上海市', '广州市', '深圳市', '杭州市'];
    const suffixes = ['XX路123号', 'XX大厦', 'XX小区5栋', 'XX园区A座', 'XX广场'];
    return (
        prefixes[Math.floor(Math.random() * prefixes.length)] +
        suffixes[Math.floor(Math.random() * suffixes.length)]
    );
}

function generateAlarmContent(): string {
    const contents = [
        '设备离线',
        'GPS信号丢失',
        '电量低于20%',
        '围栏越界',
        '设备异常重启',
        '传感器故障',
        '通信超时',
        '定位漂移严重',
    ];
    return contents[Math.floor(Math.random() * contents.length)];
}

function generateDeviceName(): string {
    const models = ['Tracker', 'Locator', 'Beacon', 'Guardian', 'Sentinel'];
    const id = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
    return `${models[Math.floor(Math.random() * models.length)]}-${id}`;
}

export function generateMockTableData(count: number): TableRowDataType[] {
    const data: TableRowDataType[] = [];

    for (let i = 0; i < count; i++) {
        // 随机生成时间（过去7天内）
        const now = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const alarmTime = now - Math.floor(Math.random() * sevenDays);

        // 随机坐标（以北京为中心的小范围）
        const baseLat = 39.9042;
        const baseLng = 116.4074;
        const latitude = baseLat + (Math.random() - 0.5) * 0.1; // ±0.05°
        const longitude = baseLng + (Math.random() - 0.5) * 0.1;

        const alarmStatus = Math.random() > 0.3; // 70% 为 true
        const includeAddress = Math.random() > 0.2; // 80% 包含地址

        data.push({
            id: generateApiKey(),
            alarmStatus,
            alarmTime,
            alarmContent: generateAlarmContent(),
            latitude,
            longitude,
            address: includeAddress ? generateRandomAddress() : undefined,
            deviceId: generateApiKey(),
            deviceName: generateDeviceName(),
        });
    }

    return data;
}
