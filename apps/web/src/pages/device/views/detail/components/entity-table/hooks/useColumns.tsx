import { useMemo } from 'react';
import { Stack, IconButton, Chip, ChipProps } from '@mui/material';
import { getGridSingleSelectOperators, getGridStringOperators } from '@mui/x-data-grid';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import { ListAltIcon, EditIcon } from '@milesight/shared/src/components';
import { Tooltip, type ColumnType, PermissionControlHidden } from '@/components';
import { type DeviceAPISchema } from '@/services/http';
import { ENTITY_TYPE, PERMISSIONS } from '@/constants';

type OperationType = 'detail' | 'edit';

export type TableRowDataType = ObjectToCamelCase<
    DeviceAPISchema['getDetail']['response']['entities'][0]
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

// Entity type Tag Color mapping
const entityTypeColorMap: Record<string, ChipProps['color']> = {
    event: 'success',
    service: 'warning',
    property: 'primary',
};

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
                headerName: getIntlText('device.label.param_entity_name'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
                filterable: true,
                disableColumnMenu: false,
                filterOperators: getGridStringOperators().filter(item => item.value === 'contains'),
            },
            {
                field: 'key',
                headerName: getIntlText('device.label.param_entity_id'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
            },
            {
                field: 'type',
                headerName: getIntlText('common.label.entity_type'),
                flex: 1,
                minWidth: 150,
                filterable: true,
                disableColumnMenu: false,
                type: 'singleSelect',
                valueOptions: Object.entries(ENTITY_TYPE).map(([key, value]) => ({
                    label: key,
                    value,
                })),
                filterOperators: getGridSingleSelectOperators().filter(item => item.value === 'is'),
                renderCell({ value }) {
                    return (
                        <Chip
                            size="small"
                            color={entityTypeColorMap[(value || '').toLocaleLowerCase()]}
                            label={value}
                            sx={{ borderRadius: 1, lineHeight: '24px' }}
                        />
                    );
                },
            },
            {
                field: 'valueType',
                headerName: getIntlText('common.label.type'),
                align: 'left',
                headerAlign: 'left',
                flex: 1,
                minWidth: 150,
                ellipsis: true,
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
                            <PermissionControlHidden permissions={PERMISSIONS.ENTITY_DATA_EDIT}>
                                <Tooltip title={getIntlText('common.button.edit')}>
                                    <IconButton
                                        sx={{
                                            width: 30,
                                            height: 30,
                                        }}
                                        onClick={() => onButtonClick('edit', row)}
                                    >
                                        <EditIcon sx={{ width: 20, height: 20 }} />
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
