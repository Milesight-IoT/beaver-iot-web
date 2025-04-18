import { useMemo } from 'react';
import { Stack, IconButton, Chip, type ChipProps } from '@mui/material';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import { ListAltIcon, DeleteOutlineIcon, ContentCopyIcon } from '@milesight/shared/src/components';
import { Tooltip, type ColumnType, PermissionControlDisabled } from '@/components';
import { type EntityAPISchema } from '@/services/http';
import { ENTITY_ACCESS_MODE, ENTITY_VALUE_TYPE, PERMISSIONS } from '@/constants';
import { useMemoizedFn } from 'ahooks';

type OperationType = 'edit' | 'delete' | 'copy';

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

    // get ENTITY_ACCESS_MODE intl text
    const getAccessModeText = useMemoizedFn(value => {
        if (value === ENTITY_ACCESS_MODE.W) {
            return getIntlText('entity.label.entity_type_of_access_write');
        }
        if (value === ENTITY_ACCESS_MODE.R) {
            return getIntlText('entity.label.entity_type_of_access_readonly');
        }
        return getIntlText('entity.label.entity_type_of_access_read_and_write');
    });

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
                field: 'entityAccessMod',
                headerName: getIntlText('entity.label.entity_type_of_access'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
                renderCell({ value }) {
                    return getAccessModeText(value);
                },
                filteredValue: filteredInfo?.entityAccessMod,
                filters: Object.entries(ENTITY_ACCESS_MODE).map(([key, value]) => ({
                    text: getAccessModeText(value),
                    value: value as keyof typeof ENTITY_ACCESS_MODE,
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
                filters: Object.entries(ENTITY_VALUE_TYPE).map(([key, value]) => ({
                    text: key,
                    value,
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
                                        <ListAltIcon sx={{ width: 20, height: 20 }} />
                                    </IconButton>
                                </Tooltip>
                            </PermissionControlDisabled>
                            <PermissionControlDisabled permissions={PERMISSIONS.ENTITY_CUSTOM_EDIT}>
                                <Tooltip title={getIntlText('common.label.copy')}>
                                    <IconButton
                                        sx={{ width: 30, height: 30 }}
                                        onClick={() => onButtonClick('copy', row)}
                                    >
                                        <ContentCopyIcon sx={{ width: 18, height: 18 }} />
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
