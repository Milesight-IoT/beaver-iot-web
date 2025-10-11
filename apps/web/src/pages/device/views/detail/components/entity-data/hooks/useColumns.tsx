import { useMemo } from 'react';
import { Stack, IconButton } from '@mui/material';
import { isNil } from 'lodash-es';
import { useI18n } from '@milesight/shared/src/hooks';
import { ListAltIcon, EditIcon, WorkflowIcon } from '@milesight/shared/src/components';
import {
    Tooltip,
    PermissionControlHidden,
    FILTER_OPERATORS,
    getOperatorsByExclude,
    MultiTag,
    Tag,
    TitleIcon,
    type ColumnType,
} from '@/components';
import { type EntityAPISchema } from '@/services/http';
import { ENTITY_TYPE, PERMISSIONS } from '@/constants';
import useAdvancedValues from './useAdvancedValues';

type OperationType = 'detail' | 'edit' | 'filter';

export type TableRowDataType = ObjectToCamelCase<
    EntityAPISchema['advancedSearch']['response']['content'][0]
>;

export interface UseColumnsProps<T> {
    entityType?: ENTITY_TYPE;

    /**
     * filtered info
     */
    filteredInfo?: Record<string, any>;

    /**
     * Operation Button click callback
     */
    onButtonClick: (
        type: OperationType,
        record: T,
        tag?: NonNullable<TableRowDataType['entityTags']>[0],
    ) => void;
}

const useColumns = <T extends TableRowDataType>({
    entityType,
    onButtonClick,
}: UseColumnsProps<T>) => {
    const { getIntlText } = useI18n();
    const { advancedValuesMapper } = useAdvancedValues();

    const columns = useMemo<ColumnType<T>[]>(() => {
        let result: ColumnType<T>[] = [
            {
                field: 'entityName',
                headerName: getIntlText('device.label.param_entity_name'),
                flex: 1,
                minWidth: 150,
                // ellipsis: true,
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
                field: 'entityKey',
                headerName: getIntlText('device.label.param_entity_id'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
                operators: getOperatorsByExclude([
                    FILTER_OPERATORS.IS_EMPTY,
                    FILTER_OPERATORS.IS_NOT_EMPTY,
                    FILTER_OPERATORS.ANY_EQUALS,
                ]),
                operatorValueCompType: 'input',
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
                field: 'entityValueType',
                headerName: getIntlText('common.label.type'),
                align: 'left',
                headerAlign: 'left',
                flex: 1,
                minWidth: 150,
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

        if (entityType) {
            result =
                entityType === ENTITY_TYPE.PROPERTY
                    ? result
                    : result.filter(item => item.field !== 'entityLatestValue');
        }

        return result;
    }, [entityType, advancedValuesMapper, getIntlText, onButtonClick]);

    return columns;
};

export default useColumns;
