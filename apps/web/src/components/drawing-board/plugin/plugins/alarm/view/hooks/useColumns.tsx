import { useMemo } from 'react';
import { Stack, IconButton } from '@mui/material';
import { get } from 'lodash-es';

import { useI18n, useTime } from '@milesight/shared/src/hooks';
import {
    FilterAltIcon,
    CheckCircleOutlineIcon,
    NearMeOutlinedIcon,
    LoadingWrapper,
} from '@milesight/shared/src/components';

import { Tooltip, type ColumnType } from '@/components';
import { toSixDecimals, openGoogleMap } from '@/components/drawing-board/plugin/utils';
import { type DeviceAlarmDetail } from '@/services/http';
import ClaimChip from '../components/claim-chip';
import { useAlarmClaim } from './useAlarmClaim';

export type TableRowDataType = ObjectToCamelCase<DeviceAlarmDetail>;

export interface UseColumnsProps {
    /**
     * Is preview mode
     */
    isPreview?: boolean;
    /**
     * Refresh list callback
     */
    refreshList?: () => void;
    filteredInfo?: Record<string, any>;
}

export enum AlarmStatus {
    Claimed = 0,
    Unclaimed = 1,
}

const useColumns = <T extends TableRowDataType>({
    isPreview,
    refreshList,
    filteredInfo,
}: UseColumnsProps) => {
    const { getIntlText } = useI18n();
    const { getTimeFormat } = useTime();
    const { claimAlarm, claimLoading } = useAlarmClaim(refreshList);

    const statusFilterOptions = useMemo(() => {
        return [
            {
                label: getIntlText('common.label.unclaimed'),
                value: AlarmStatus.Unclaimed,
            },
            {
                label: getIntlText('common.label.claimed'),
                value: AlarmStatus.Claimed,
            },
        ];
    }, [getIntlText]);

    const columns: ColumnType<T>[] = useMemo(() => {
        return [
            {
                field: 'alarmStatus',
                headerName: getIntlText('device.label.device_status'),
                flex: 1,
                minWidth: 120,
                filteredValue: filteredInfo?.alarmStatus,
                filterIcon: (filtered: boolean) => {
                    return (
                        <FilterAltIcon
                            sx={{
                                color: filtered ? 'var(--primary-color-7)' : 'var(--gray-color-5)',
                            }}
                        />
                    );
                },
                filters: statusFilterOptions.map(o => ({
                    text: o.label,
                    value: o.value,
                })),
                renderCell({ value }) {
                    return <ClaimChip unclaimed={!!value} />;
                },
            },
            {
                field: 'alarmContent',
                headerName: getIntlText('common.label.content'),
                flex: 1,
                minWidth: 240,
                renderCell({ row }) {
                    return (
                        <div className="alarm-view__table-content">
                            <Tooltip autoEllipsis title={row?.deviceName || '-'} />
                            <Tooltip autoEllipsis title={row?.alarmContent || '-'} />
                        </div>
                    );
                },
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
                    if (!row?.latitude || !row?.longitude) {
                        return '-';
                    }

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
                            <LoadingWrapper
                                size={20}
                                loading={get(claimLoading, String(row?.id), false)}
                            >
                                <Tooltip
                                    isDisabledButton={!row?.alarmStatus}
                                    title={getIntlText('common.tip.click_to_claim')}
                                >
                                    <IconButton
                                        disabled={!row?.alarmStatus}
                                        sx={{
                                            width: 30,
                                            height: 30,
                                            color: 'text.secondary',
                                        }}
                                        onClick={() => {
                                            if (isPreview) {
                                                return;
                                            }

                                            claimAlarm?.(row?.deviceId, row?.id);
                                        }}
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
                                        if (isPreview) {
                                            return;
                                        }

                                        openGoogleMap(row?.latitude, row?.longitude);
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
    }, [
        getIntlText,
        getTimeFormat,
        isPreview,
        filteredInfo,
        statusFilterOptions,
        claimLoading,
        claimAlarm,
    ]);

    return {
        columns,
    };
};

export default useColumns;
