import { useMemo } from 'react';
import { useMemoizedFn } from 'ahooks';
import { Stack, IconButton, Chip, type ChipProps } from '@mui/material';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import {
    ContentCopyIcon,
    DeleteOutlineIcon,
    EditIcon,
    FilterAltIcon,
} from '@milesight/shared/src/components';
import { Tooltip, type ColumnType, PermissionControlDisabled } from '@/components';
import { type EntityAPISchema } from '@/services/http';
import { ENTITY_ACCESS_MODE, ENTITY_VALUE_TYPE, PERMISSIONS } from '@/constants';

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
                width: 200,
                minWidth: 160,
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
                headerName: getIntlText('common.label.entity_type'),
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
                filterIcon: (filtered: boolean) => {
                    return (
                        <FilterAltIcon
                            sx={{
                                color: filtered ? 'var(--primary-color-7)' : 'var(--gray-color-5)',
                            }}
                        />
                    );
                },
                filters: Object.entries(ENTITY_ACCESS_MODE).map(([key, value]) => ({
                    text: getAccessModeText(value),
                    value: value as keyof typeof ENTITY_ACCESS_MODE,
                })),
            },
            {
                field: 'entityValueType',
                headerName: getIntlText('common.label.type'),
                align: 'left',
                headerAlign: 'left',
                flex: 1,
                minWidth: 150,
                ellipsis: true,
            },
            {
                field: 'unit',
                headerName: getIntlText('common.label.unit'),
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
                fixed: 'right',
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
                            <PermissionControlDisabled permissions={PERMISSIONS.ENTITY_CUSTOM_EDIT}>
                                <Tooltip title={getIntlText('common.label.copy')}>
                                    <IconButton
                                        sx={{ width: 30, height: 30 }}
                                        onClick={() => onButtonClick('copy', row)}
                                        disabled={
                                            !!row.entityValueAttribute.enum &&
                                            (row.entityValueType === ENTITY_VALUE_TYPE.LONG ||
                                                (row.entityValueType === ENTITY_VALUE_TYPE.STRING &&
                                                    !row.entityValueAttribute.isEnum))
                                        }
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
                                        // color="error"
                                        // disabled={!row.deletable}
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
