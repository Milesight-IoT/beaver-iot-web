import React, { useMemo } from 'react';
import { Stack, Chip, type ChipProps } from '@mui/material';
import { getGridSingleSelectOperators, getGridStringOperators } from '@mui/x-data-grid';
import { useI18n } from '@milesight/shared/src/hooks';
import { TablePro, type ColumnType } from '@/components';
import { type DeviceAPISchema } from '@/services/http';

interface Props {
    data?: ObjectToCamelCase<DeviceAPISchema['getDetail']['response']>;

    /** 点击 Table 刷新按钮回调 */
    onRefresh?: () => void;
}

type TableRowDataType = ObjectToCamelCase<DeviceAPISchema['getDetail']['response']['entities'][0]>;

// 实体类型 Tag 颜色映射
const entityTypeColorMap: Record<string, ChipProps['color']> = {
    event: 'success',
    service: 'warning',
    property: 'primary',
};

/**
 * 设备实体数据表格
 */
const EntityTable: React.FC<Props> = ({ data, onRefresh }) => {
    const { getIntlText } = useI18n();
    const columns = useMemo(() => {
        const entityTypeFilterOptions: { label: EntityType; value: EntityType }[] = [
            {
                label: 'PROPERTY',
                value: 'PROPERTY',
            },
            {
                label: 'SERVICE',
                value: 'SERVICE',
            },
            {
                label: 'EVENT',
                value: 'EVENT',
            },
        ];
        const result: ColumnType<TableRowDataType>[] = [
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
                field: 'id',
                headerName: getIntlText('device.label.param_entity_id'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
            },
            {
                field: 'type',
                headerName: getIntlText('common.label.type'),
                flex: 1,
                minWidth: 150,
                filterable: true,
                disableColumnMenu: false,
                type: 'singleSelect',
                valueOptions: entityTypeFilterOptions,
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
                headerName: getIntlText('common.label.data_type'),
                align: 'left',
                headerAlign: 'left',
                flex: 1,
                minWidth: 150,
                ellipsis: true,
            },
        ];

        return result;
    }, [getIntlText]);

    return (
        <Stack className="ms-com-device-entity" sx={{ height: '100%' }}>
            <TablePro<TableRowDataType>
                paginationMode="client"
                loading={false}
                columns={columns}
                rows={data?.entities}
                onRefreshButtonClick={onRefresh}
            />
        </Stack>
    );
};

export default EntityTable;
