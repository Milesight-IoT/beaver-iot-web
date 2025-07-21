import { useMemo } from 'react';
import { Stack, IconButton, Chip, type ChipProps } from '@mui/material';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import { ListAltIcon, EditIcon } from '@milesight/shared/src/components';
import {
    Tooltip,
    type ColumnType,
    PermissionControlHidden,
    FILTER_OPERATORS,
    getOperatorsByExclude,
    MultiTag,
    Tag,
} from '@/components';
import { PERMISSIONS } from '@/constants';
import { type EntityAPISchema } from '@/services/http';
import useAdvancedValues from './useAdvancedValues';

type OperationType = 'detail' | 'edit' | 'filter';

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
    onButtonClick: (
        type: OperationType,
        record: T,
        tag?: NonNullable<TableRowDataType['entityTags']>[0],
    ) => void;
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

    const { advancedValuesMapper } = useAdvancedValues();

    const columns: ColumnType<T>[] = useMemo(() => {
        return [
            {
                field: 'entityName',
                headerName: getIntlText('device.label.param_entity_name'),
                flex: 1,
                minWidth: 250,
                ellipsis: true,
                operators: getOperatorsByExclude([
                    FILTER_OPERATORS.IS_EMPTY,
                    FILTER_OPERATORS.IS_NOT_EMPTY,
                    FILTER_OPERATORS.ANY_EQUALS,
                ]),
                operatorValueCompType: 'input',
            },
            {
                field: 'deviceName',
                headerName: getIntlText('common.label.device'),
                flex: 1,
                minWidth: 120,
                ellipsis: true,
                operators: getOperatorsByExclude([
                    FILTER_OPERATORS.IS_EMPTY,
                    FILTER_OPERATORS.IS_NOT_EMPTY,
                    FILTER_OPERATORS.ANY_EQUALS,
                ]),
                operatorValueCompType: 'input',
            },
            {
                field: 'deviceGroup',
                headerName: getIntlText('entity.label.device_group'),
                flex: 1,
                minWidth: 180,
                ellipsis: true,
                operators: [FILTER_OPERATORS.ANY_EQUALS],
                getFilterValueOptions: advancedValuesMapper.getDeviceGroup,
                operatorValueCompType: 'select',
                renderCell({ value }: { value: TableRowDataType['deviceGroup'] }) {
                    return value?.name || '-';
                },
            },
            {
                field: 'entityTags',
                headerName: getIntlText('entity.label.entity_tags'),
                flex: 1,
                minWidth: 280,
                align: 'left',
                renderCell({ row, value }) {
                    return (
                        <MultiTag<NonNullable<TableRowDataType['entityTags']>[0]>
                            data={(value || []).map(
                                (tag: NonNullable<TableRowDataType['entityTags']>[0]) => ({
                                    ...tag,
                                    key: tag.id,
                                    label: tag.name,
                                    desc: tag.description,
                                }),
                            )}
                            renderItem={(tag, maxItemWidth) => {
                                return (
                                    <Tag
                                        key={tag.id}
                                        label={tag.name}
                                        arbitraryColor={tag.color}
                                        tip={tag.description}
                                        onClick={() => onButtonClick('filter', row, tag)}
                                        sx={{ maxWidth: maxItemWidth }}
                                    />
                                );
                            }}
                        />
                    );
                },
                operators: getOperatorsByExclude([
                    FILTER_OPERATORS.NE,
                    FILTER_OPERATORS.START_WITH,
                    FILTER_OPERATORS.END_WITH,
                ]),
                getFilterValueOptions: advancedValuesMapper.getEntityTags,
                operatorValueCompType: 'select',
            },
            {
                field: 'entityParentName',
                headerName: getIntlText('entity.label.parent_entity'),
                align: 'left',
                flex: 1,
                minWidth: 180,
                ellipsis: true,
                operators: getOperatorsByExclude([FILTER_OPERATORS.ANY_EQUALS]),
                operatorValueCompType: 'input',
            },
            {
                field: 'entityValueType',
                headerName: getIntlText('common.label.type'),
                align: 'left',
                flex: 1,
                minWidth: 100,
                maxWidth: 100,
                ellipsis: true,
                operators: [FILTER_OPERATORS.ANY_EQUALS],
                getFilterValueOptions: advancedValuesMapper.getEntityDataValues,
                operatorValueCompType: 'select',
            },
            {
                field: 'entityLatestValue',
                headerName: getIntlText('entity.label.latest_value'),
                flex: 1,
                minWidth: 120,
                ellipsis: true,
            },
            {
                field: 'integrationName',
                headerName: getIntlText('common.label.integration'),
                flex: 1,
                minWidth: 250,
                ellipsis: true,
                operators: getOperatorsByExclude([
                    FILTER_OPERATORS.IS_EMPTY,
                    FILTER_OPERATORS.IS_NOT_EMPTY,
                    FILTER_OPERATORS.ANY_EQUALS,
                ]),
                operatorValueCompType: 'input',
            },
            {
                field: 'entityKey',
                headerName: getIntlText('device.label.param_entity_id'),
                flex: 1,
                minWidth: 300,
                ellipsis: true,
                hidden: true,
                operators: getOperatorsByExclude([
                    FILTER_OPERATORS.IS_EMPTY,
                    FILTER_OPERATORS.IS_NOT_EMPTY,
                    FILTER_OPERATORS.ANY_EQUALS,
                ]),
                operatorValueCompType: 'input',
            },
            {
                field: '$operation',
                headerName: getIntlText('common.label.operation'),
                width: 120,
                flex: 0,
                display: 'flex',
                align: 'left',
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

export default useEntityColumns;
