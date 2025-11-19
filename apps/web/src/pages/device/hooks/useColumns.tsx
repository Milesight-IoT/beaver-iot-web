import { useMemo } from 'react';
import { Stack, IconButton } from '@mui/material';
import { isNumber } from 'lodash-es';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import {
    ListAltIcon,
    DeleteOutlineIcon,
    DriveFileMoveOutlinedIcon,
} from '@milesight/shared/src/components';
import { Tooltip, PermissionControlHidden, DeviceStatus, type ColumnType } from '@/components';
import { type DeviceAPISchema } from '@/services/http';
import { PERMISSIONS } from '@/constants';

type OperationType = 'detail' | 'delete' | 'changeGroup';

export type TableRowDataType = ObjectToCamelCase<
    DeviceAPISchema['getList']['response']['content'][0]
>;

export interface UseColumnsProps<T> {
    /**
     * Operation Button click callback
     */
    onButtonClick: (type: OperationType, record: T) => void;
    /**
     * filtered info
     */
    filteredInfo: Record<string, any>;
}

const useColumns = <T extends TableRowDataType>({
    onButtonClick,
    filteredInfo,
}: UseColumnsProps<T>) => {
    const { getIntlText } = useI18n();
    const { getTimeFormat } = useTime();

    const columns: ColumnType<T>[] = useMemo(() => {
        return [
            {
                field: 'name',
                headerName: getIntlText('device.label.param_device_name'),
                flex: 2,
                minWidth: 250,
                ellipsis: true,
                // disableColumnMenu: false,
            },
            {
                field: 'identifier',
                headerName: getIntlText('device.label.param_external_id'),
                ellipsis: true,
                flex: 1,
                minWidth: 250,
                filteredValue: filteredInfo?.identifier,
                filterSearchType: 'search',
            },
            {
                field: 'status',
                headerName: getIntlText('device.label.device_status'),
                flex: 1,
                minWidth: 120,
                renderCell({ value }) {
                    return <DeviceStatus type={value} />;
                },
            },
            {
                field: 'createdAt',
                headerName: getIntlText('common.label.create_time'),
                flex: 1,
                minWidth: 250,
                ellipsis: true,
                renderCell({ value }) {
                    return getTimeFormat(value);
                },
            },
            {
                field: 'groupName',
                headerName: getIntlText('device.label.device_group'),
                ellipsis: true,
                flex: 1,
                minWidth: 250,
            },
            {
                field: 'location',
                headerName: getIntlText('common.label.location'),
                ellipsis: true,
                flex: 1,
                minWidth: 250,
                renderCell({ row }) {
                    const { location } = row;

                    if (!location) return '-';
                    return `${location.latitude}, ${location.longitude}`;
                },
            },
            {
                field: 'integrationName',
                headerName: getIntlText('common.label.source'),
                ellipsis: true,
                flex: 1,
                minWidth: 250,
            },
            {
                field: '$operation',
                headerName: getIntlText('common.label.operation'),
                width: 120,
                display: 'flex',
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
                            <Tooltip title={getIntlText('common.label.detail')}>
                                <IconButton
                                    sx={{ width: 30, height: 30 }}
                                    onClick={() => onButtonClick('detail', row)}
                                >
                                    <ListAltIcon sx={{ width: 20, height: 20 }} />
                                </IconButton>
                            </Tooltip>
                            <PermissionControlHidden permissions={PERMISSIONS.DEVICE_EDIT}>
                                <Tooltip title={getIntlText('device.label.change_device_group')}>
                                    <IconButton
                                        sx={{ width: 30, height: 30 }}
                                        onDoubleClick={e => e.stopPropagation()}
                                        onClick={() => onButtonClick('changeGroup', row)}
                                    >
                                        <DriveFileMoveOutlinedIcon sx={{ width: 20, height: 20 }} />
                                    </IconButton>
                                </Tooltip>
                            </PermissionControlHidden>
                            <PermissionControlHidden permissions={PERMISSIONS.DEVICE_DELETE}>
                                <Tooltip title={getIntlText('common.label.delete')}>
                                    <IconButton
                                        // color="error"
                                        disabled={!row.deletable}
                                        sx={{
                                            width: 30,
                                            height: 30,
                                            color: 'text.secondary',
                                            // '&:hover': { color: 'error.light' },
                                        }}
                                        onClick={() => onButtonClick('delete', row)}
                                    >
                                        <DeleteOutlineIcon sx={{ width: 20, height: 20 }} />
                                    </IconButton>
                                </Tooltip>
                            </PermissionControlHidden>
                        </Stack>
                    );
                },
            },
        ];
    }, [getIntlText, getTimeFormat, onButtonClick, filteredInfo]);

    return columns;
};

export default useColumns;
