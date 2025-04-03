import { useMemo } from 'react';
import { Stack, IconButton, Chip, type ChipProps } from '@mui/material';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import { EditIcon, DeleteOutlineIcon } from '@milesight/shared/src/components';
import { Tooltip, type ColumnType, PermissionControlDisabled } from '@/components';
import { type EntityAPISchema } from '@/services/http';
import { ENTITY_ACCESS_MODE, ENTITY_VALUE_TYPE, PERMISSIONS } from '@/constants';

type OperationType = 'edit' | 'delete';

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

const useColumns = <T extends TableRowDataType>({
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
            },
            {
                field: 'entityKey',
                headerName: getIntlText('device.label.param_entity_id'),
                flex: 1,
                minWidth: 300,
                ellipsis: true,
            },
            {
                field: 'entityType',
                headerName: getIntlText('common.label.type'),
                flex: 1,
                minWidth: 100,
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
                field: 'entityAccessMod',
                headerName: getIntlText('entity.label.entity_type_of_access'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
                renderCell({ value }) {
                    let intlKey = 'entity.label.entity_type_of_access_read_and_write';
                    if (value === ENTITY_ACCESS_MODE.W) {
                        intlKey = 'entity.label.entity_type_of_access_write';
                    } else if (value === ENTITY_ACCESS_MODE.R) {
                        intlKey = 'entity.label.entity_type_of_access_readonly';
                    }
                    return getIntlText(intlKey);
                },
                filteredValue: filteredInfo?.entityAccessMod,
                filters: Object.keys(ENTITY_ACCESS_MODE).map(key => ({
                    text: ENTITY_ACCESS_MODE[key as keyof typeof ENTITY_ACCESS_MODE],
                    value: ENTITY_ACCESS_MODE[key as keyof typeof ENTITY_ACCESS_MODE],
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
                filters: Object.keys(ENTITY_VALUE_TYPE).map(key => ({
                    text: ENTITY_VALUE_TYPE[key as keyof typeof ENTITY_VALUE_TYPE],
                    value: ENTITY_VALUE_TYPE[key as keyof typeof ENTITY_VALUE_TYPE],
                })),
            },
            {
                field: 'unit',
                headerName: getIntlText('entity.label.unit'),
                align: 'left',
                headerAlign: 'left',
                flex: 1,
                minWidth: 100,
                ellipsis: true,
                renderCell({ row }) {
                    return row?.entityValueAttribute?.unit;
                },
                filteredValue: filteredInfo?.unit,
                filterSearchType: 'search',
            },
            {
                field: 'entityCreatedAt',
                headerName: getIntlText('common.label.create_time'),
                flex: 1,
                minWidth: 200,
                ellipsis: true,
                renderCell({ value }) {
                    if (!value) {
                        return;
                    }
                    return getTimeFormat(value);
                },
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
                            <PermissionControlDisabled permissions={PERMISSIONS.ENTITY_CUSTOM_EDIT}>
                                <Tooltip title={getIntlText('common.button.edit')}>
                                    <IconButton
                                        sx={{ width: 30, height: 30 }}
                                        onClick={() => onButtonClick('edit', row)}
                                    >
                                        <EditIcon sx={{ width: 20, height: 20 }} />
                                    </IconButton>
                                </Tooltip>
                            </PermissionControlDisabled>
                            <PermissionControlDisabled
                                permissions={PERMISSIONS.ENTITY_CUSTOM_DELETE}
                            >
                                <Tooltip title={getIntlText('common.label.delete')}>
                                    <IconButton
                                        color="error"
                                        // disabled={!row.deletable}
                                        sx={{
                                            width: 30,
                                            height: 30,
                                            color: 'text.secondary',
                                            '&:hover': { color: 'error.light' },
                                        }}
                                        onClick={() => onButtonClick('delete', row)}
                                    >
                                        <DeleteOutlineIcon sx={{ width: 20, height: 20 }} />
                                    </IconButton>
                                </Tooltip>
                            </PermissionControlDisabled>
                        </Stack>
                    );
                },
            },
        ];
    }, [getIntlText, getTimeFormat, onButtonClick, filteredInfo]);

    return columns;
};

export default useColumns;
