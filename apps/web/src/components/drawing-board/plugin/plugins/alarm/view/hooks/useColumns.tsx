import { useMemo, useState } from 'react';
import { Stack, IconButton } from '@mui/material';
import { useMemoizedFn } from 'ahooks';
import { get, isNil } from 'lodash-es';

import { useI18n, useTime } from '@milesight/shared/src/hooks';
import {
    FilterAltIcon,
    CheckCircleOutlineIcon,
    NearMeOutlinedIcon,
    LoadingWrapper,
} from '@milesight/shared/src/components';

import { Tooltip, type ColumnType, type TableProProps, type FilterValue } from '@/components';
import { toSixDecimals, openGoogleMap } from '@/components/drawing-board/plugin/utils';
import { type EntityAPISchema, type DeviceAlarmDetail } from '@/services/http';
import { ClaimChip } from '../components';

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

export enum AlarmStatus {
    Claimed = 1,
    Unclaimed = 0,
}

const useColumns = <T extends TableRowDataType>({ isPreview, entitiesStatus }: UseColumnsProps) => {
    const { getIntlText } = useI18n();
    const { getTimeFormat } = useTime();

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [filteredInfo, setFilteredInfo] = useState<Record<string, any>>({});

    const statusFilterOptions = useMemo(() => {
        return [
            {
                label: getIntlText('common.label.claimed'),
                value: AlarmStatus.Claimed,
            },
            {
                label: getIntlText('common.label.unclaimed'),
                value: AlarmStatus.Unclaimed,
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
                    return <ClaimChip claimed={!!value} />;
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
                                        onClick={() => {
                                            if (isPreview) {
                                                return;
                                            }

                                            console.log('click to claim', row);
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
    }, [getIntlText, getTimeFormat, isPreview, filteredInfo, statusFilterOptions]);

    const handleFilterChange: TableProProps<TableRowDataType>['onFilterInfoChange'] = (
        filters: Record<string, FilterValue | null>,
    ) => {
        setFilteredInfo(filters);
    };

    return {
        columns,
        paginationModel,
        setPaginationModel,
        handleFilterChange,
    };
};

export default useColumns;
