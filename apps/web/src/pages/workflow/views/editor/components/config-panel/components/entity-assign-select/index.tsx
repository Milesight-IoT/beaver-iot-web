import React, { useEffect, useLayoutEffect, useMemo } from 'react';
import { Button, IconButton } from '@mui/material';
import { isEqual, isNil } from 'lodash-es';
import { useDynamicList, useControllableValue } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { AddIcon, CloseIcon } from '@milesight/shared/src/components';
import useWorkflow from '../../../../hooks/useWorkflow';
import { DEFAULT_BOOLEAN_DATA_ENUMS } from '../../../../constants';
import EntitySelect, { type EntitySelectProps } from '../entity-select';
import EntityParamSelect from '../entity-param-select';
import ParamInputSelect from '../param-input-select';
import './style.less';

export type EntityAssignInputValueType =
    | NonNullable<AssignerNodeDataType['parameters']>['exchangePayload']
    | undefined;
export type EntityAssignInputInnerValueType = [string, string | boolean] | undefined;

export interface EntityAssignSelectProps {
    label?: string[];
    required?: boolean;
    multiple?: boolean;
    error?: boolean;
    /**
     * Whether enable to select param from upstream nodes
     */
    enableSelectParam?: boolean;
    helperText?: React.ReactNode;
    value?: EntityAssignInputValueType;
    defaultValue?: EntityAssignInputValueType;
    onChange?: (value: EntityAssignInputValueType) => void;
    filterModel?: EntitySelectProps['filterModel'];
}

type CustomEntityItemType = {
    key: ApiKey;
    type: EntityValueDataType;
    enums: Record<string, any>;
};

const MAX_VALUE_LENGTH = 10;
const arrayToObject = (arr: EntityAssignInputInnerValueType[]) => {
    const result: EntityAssignInputValueType = {};
    arr?.forEach(item => {
        if (!item) return;
        result[item[0]] = item[1];
    });
    return result;
};

/**
 * Entity Assignment Input Component
 *
 * Note: use in EntityAssignmentNode
 */
const EntityAssignSelect: React.FC<EntityAssignSelectProps> = ({
    label,
    required = true,
    multiple = true,
    filterModel,
    enableSelectParam,
    ...props
}) => {
    const { getIntlText } = useI18n();
    const { getEntityDetail } = useWorkflow();
    const [data, setData] = useControllableValue<EntityAssignInputValueType>(props);
    const { list, remove, getKey, insert, replace, resetList } =
        useDynamicList<EntityAssignInputInnerValueType>(Object.entries(data || {}));
    const entityDetails = useMemo(() => {
        const result: (CustomEntityItemType | undefined)[] = [];

        list?.forEach(item => {
            const key = item?.[0];
            const detail = getEntityDetail(key);

            if (!key || !detail) {
                result.push(undefined);
                return;
            }

            const type = detail.entity_value_type;
            const enums =
                detail.entity_value_attribute?.enum ||
                (type !== 'BOOLEAN'
                    ? undefined
                    : DEFAULT_BOOLEAN_DATA_ENUMS.reduce(
                          (acc, item) => {
                              acc[item.key] = getIntlText(item.labelIntlKey);
                              return acc;
                          },
                          {} as Record<string, any>,
                      ));
            result.push({ key, type, enums });
        });

        return result;
    }, [list, getEntityDetail, getIntlText]);

    useLayoutEffect(() => {
        if (isEqual(data, arrayToObject(list))) return;
        resetList(Object.entries(data || {}));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, resetList]);

    useEffect(() => {
        setData?.(arrayToObject(list));
    }, [list, setData]);

    return (
        <div className="ms-entity-assign-select">
            {list.map((item, index) => (
                <div className="ms-entity-assign-select-item" key={getKey(index)}>
                    {!enableSelectParam ? (
                        <EntitySelect
                            size="small"
                            required={required}
                            filterModel={filterModel}
                            value={item?.[0] || ''}
                            onChange={value => {
                                replace(index, [`${value || ''}`, item?.[1] || '']);
                            }}
                            dropdownMatchSelectWidth={360}
                        />
                    ) : (
                        <EntityParamSelect
                            size="small"
                            required={required}
                            filterModel={filterModel}
                            value={item?.[0] || ''}
                            onChange={value => {
                                replace(index, [`${value || ''}`, item?.[1] || '']);
                            }}
                            dropdownMatchSelectWidth={360}
                        />
                    )}
                    <ParamInputSelect
                        size="small"
                        required={required}
                        value={item?.[1]}
                        valueType={entityDetails[index]?.type}
                        enums={entityDetails[index]?.enums}
                        onChange={data => {
                            replace(index, [item?.[0] || '', isNil(data) ? '' : data]);
                        }}
                    />
                    <IconButton className="btn-delete" onClick={() => remove(index)}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </div>
            ))}
            {multiple && (
                <Button
                    variant="text"
                    className="btn-add"
                    startIcon={<AddIcon />}
                    disabled={list.length >= MAX_VALUE_LENGTH}
                    onClick={() => {
                        if (list.length >= MAX_VALUE_LENGTH) return;
                        insert(list.length, ['', '']);
                    }}
                >
                    {getIntlText('common.label.add')}
                </Button>
            )}
        </div>
    );
};

export default EntityAssignSelect;
