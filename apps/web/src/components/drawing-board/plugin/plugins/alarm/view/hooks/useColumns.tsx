import { useMemo } from 'react';
import { Stack, IconButton, type SxProps } from '@mui/material';
import { get, isEmpty, isNil } from 'lodash-es';

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
    Claimed = 'Claimed',
    Unclaimed = 'Unclaimed',
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

    /**
     * Filter alarm status
     */
    const filterAlarmStatus = useMemo(() => {
        const status = filteredInfo?.alarmStatus;
        if (!Array.isArray(status) || isEmpty(status)) {
            return;
        }

        return (status as boolean[]).map(s =>
            s ? AlarmStatus.Unclaimed : AlarmStatus.Claimed,
        ) as unknown as string;
    }, [filteredInfo]);

    const operationIconSx = useMemo((): SxProps => {
        return {
            width: 36,
            height: 36,
            color: 'text.secondary',
            '&.MuiButtonBase-root.MuiIconButton-root:hover': {
                color: 'text.secondary',
            },
            '&.MuiIconButton-root:hover': {
                backgroundColor: 'var(--hover-background-1)',
                borderRadius: '50%',
            },
        };
    }, []);

    const columns: ColumnType<T>[] = useMemo(() => {
        return [
            {
                field: 'alarmStatus',
                headerName: getIntlText('device.label.device_status'),
                flex: 1,
                minWidth: 120,
                filteredValue: filterAlarmStatus,
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
                flex: 3,
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
                                wrapperStyle={{
                                    cursor: !row?.alarmStatus ? 'not-allowed' : undefined,
                                }}
                                size={20}
                                loading={get(claimLoading, String(row?.id), false)}
                            >
                                <Tooltip
                                    title={
                                        !row?.alarmStatus
                                            ? null
                                            : getIntlText('common.tip.click_to_claim')
                                    }
                                >
                                    <IconButton
                                        disabled={!row?.alarmStatus}
                                        sx={operationIconSx}
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
                            <Tooltip
                                isDisabledButton={isNil(row?.latitude) || isNil(row?.longitude)}
                                title={getIntlText('dashboard.tip.navigate_here')}
                            >
                                <IconButton
                                    disabled={isNil(row?.latitude) || isNil(row?.longitude)}
                                    sx={operationIconSx}
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
        statusFilterOptions,
        claimLoading,
        claimAlarm,
        filterAlarmStatus,
        operationIconSx,
    ]);

    return {
        columns,
    };
};

export default useColumns;
