import { useMemo } from 'react';
import { Stack, IconButton, Chip, type ChipProps } from '@mui/material';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import { ListAltIcon, EditIcon } from '@milesight/shared/src/components';
import { Tooltip, type ColumnType } from '@/components';
import { type EntityAPISchema } from '@/services/http';

type OperationType = 'detail' | 'edit';

export type TableRowDataType = ObjectToCamelCase<
    EntityAPISchema['getList']['response']['content'][0]
>;

// 实体类型 Tag 颜色映射
const entityTypeColorMap: Record<string, ChipProps['color']> = {
    event: 'success',
    service: 'warning',
    property: 'primary',
};

export interface UseColumnsProps<T> {
    /**
     * 操作 Button 点击回调
     */
    onButtonClick: (type: OperationType, record: T) => void;
}

const useEntityColumns = <T extends TableRowDataType>({ onButtonClick }: UseColumnsProps<T>) => {
    const { getIntlText } = useI18n();
    const { getTimeFormat } = useTime();

    const columns: ColumnType<T>[] = useMemo(() => {
        return [
            {
                field: 'entityName',
                headerName: getIntlText('device.label.param_entity_name'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
            },
            {
                field: 'entityKey',
                headerName: getIntlText('device.label.param_entity_id'),
                flex: 1,
                minWidth: 200,
                ellipsis: true,
            },
            {
                field: 'entityType',
                headerName: getIntlText('common.label.type'),
                flex: 1,
                minWidth: 150,
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
                field: 'entityValueType',
                headerName: getIntlText('common.label.data_type'),
                align: 'left',
                headerAlign: 'left',
                flex: 1,
                minWidth: 150,
                ellipsis: true,
            },
            {
                field: 'integrationName',
                headerName: getIntlText('device.label.param_source'),
                flex: 1,
                minWidth: 250,
                ellipsis: true,
            },
            {
                field: '$operation',
                headerName: getIntlText('common.label.operation'),
                flex: 2,
                minWidth: 100,
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
                            <Tooltip title={getIntlText('common.label.edit')}>
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
                        </Stack>
                    );
                },
            },
        ];
    }, [getIntlText, getTimeFormat, onButtonClick]);

    return columns;
};

export default useEntityColumns;
