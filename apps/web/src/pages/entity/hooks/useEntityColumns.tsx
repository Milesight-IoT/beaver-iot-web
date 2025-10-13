import { useMemo } from 'react';
import { Stack, IconButton } from '@mui/material';
import { isNil } from 'lodash-es';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import { ListAltIcon, EditIcon, WorkflowIcon } from '@milesight/shared/src/components';
import {
    Tooltip,
    type ColumnType,
    PermissionControlHidden,
    FILTER_OPERATORS,
    getOperatorsByExclude,
    MultiTag,
    Tag,
    TitleIcon,
} from '@/components';
import { PERMISSIONS } from '@/constants';
import { type EntityAPISchema } from '@/services/http';
import useAdvancedValues from './useAdvancedValues';

type OperationType = 'detail' | 'edit' | 'filter';

export type TableRowDataType = ObjectToCamelCase<
    EntityAPISchema['getList']['response']['content'][0]
>;

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
                minWidth: 200,
                operators: getOperatorsByExclude([
                    FILTER_OPERATORS.IS_EMPTY,
                    FILTER_OPERATORS.IS_NOT_EMPTY,
                    FILTER_OPERATORS.ANY_EQUALS,
                ]),
                operatorValueCompType: 'input',
                renderCell({ row }) {
                    const { entityName, workflowData } = row;

                    return (
                        <TitleIcon
                            icon={<WorkflowIcon />}
                            title={entityName}
                            tooltip={
                                workflowData &&
                                getIntlText('device.tip.blueprint_entity_come_from', {
                                    1: workflowData.name,
                                    2: workflowData.id,
                                })
                            }
                        />
                    );
                },
            },
            {
                field: 'deviceName',
                headerName: getIntlText('common.label.device'),
                flex: 1,
                minWidth: 160,
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
                operatorValues: advancedValuesMapper.getDeviceGroup,
                operatorValueCompType: 'select',
                renderCell({ value }) {
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
                operatorValues: advancedValuesMapper.getEntityTags,
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
                operatorValues: advancedValuesMapper.getEntityDataValues,
                operatorValueCompType: 'select',
            },
            {
                field: 'entityLatestValue',
                headerName: getIntlText('entity.label.latest_value'),
                flex: 1,
                minWidth: 120,
                ellipsis: true,
                renderCell({ row }) {
                    const { enum: enumMap, unit = '' } = row.entityValueAttribute || {};
                    const value = isNil(row.entityLatestValue)
                        ? ''
                        : enumMap?.[row.entityLatestValue] || `${row.entityLatestValue}`;

                    return value ? `${value}${unit}` : '-';
                },
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
                display: 'flex',
                align: 'left',
                fixed: 'right',
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
