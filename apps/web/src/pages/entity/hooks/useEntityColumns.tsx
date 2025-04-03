import { useMemo } from 'react';
import { Stack, IconButton, Chip, type ChipProps } from '@mui/material';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import { ListAltIcon, EditIcon } from '@milesight/shared/src/components';
import { Tooltip, type ColumnType, PermissionControlHidden } from '@/components';
import { ENTITY_TYPE, ENTITY_DATA_VALUE_TYPE, PERMISSIONS } from '@/constants';
import { type EntityAPISchema } from '@/services/http';

type OperationType = 'detail' | 'edit';

export type TableRowDataType = ObjectToCamelCase<
    EntityAPISchema['getList']['response']['content'][0]
>;

// Entity type Tag Color mapping
const entityTypeColorMap: Record<string, ChipProps['color']> = {
    event: 'success',
    service: 'warning',
    property: 'primary',
};

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

const useEntityColumns = <T extends TableRowDataType>({
    onButtonClick,
    filteredInfo,
}: UseColumnsProps<T>) => {
    const { getIntlText } = useI18n();
    const { getTimeFormat } = useTime();

    const columns: ColumnType<T>[] = useMemo(() => {
        return [
            {
                field: 'entityName',
                headerName: getIntlText('device.label.param_entity_name'),
                flex: 1,
                minWidth: 250,
                ellipsis: true,
                filterSearchType: 'search',
                filteredValue: filteredInfo?.entityName,
            },
            {
                field: 'entityKey',
                headerName: getIntlText('device.label.param_entity_id'),
                flex: 1,
                minWidth: 300,
                ellipsis: true,
                filterSearchType: 'search',
                filteredValue: filteredInfo?.entityKey,
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
                filteredValue: filteredInfo?.entityType,
                filters: Object.keys(ENTITY_TYPE).map(key => ({
                    text: ENTITY_TYPE[key as keyof typeof ENTITY_TYPE],
                    value: ENTITY_TYPE[key as keyof typeof ENTITY_TYPE],
                })),
            },
            {
                field: 'entityValueType',
                headerName: getIntlText('common.label.data_type'),
                align: 'left',
                headerAlign: 'left',
                flex: 1,
                minWidth: 150,
                ellipsis: true,
                filteredValue: filteredInfo?.entityValueType,
                filters: Object.keys(ENTITY_DATA_VALUE_TYPE).map(key => ({
                    text: ENTITY_DATA_VALUE_TYPE[key as keyof typeof ENTITY_DATA_VALUE_TYPE],
                    value: ENTITY_DATA_VALUE_TYPE[key as keyof typeof ENTITY_DATA_VALUE_TYPE],
                })),
            },
            {
                field: 'integrationName',
                headerName: getIntlText('device.label.param_source'),
                flex: 1,
                minWidth: 250,
                ellipsis: true,
                filteredValue: filteredInfo?.integrationName,
                filterSearchType: 'search',
            },
            {
                field: '$operation',
                headerName: getIntlText('common.label.operation'),
                width: 120,
                display: 'flex',
                align: 'left',
                headerAlign: 'left',
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

export default useEntityColumns;
