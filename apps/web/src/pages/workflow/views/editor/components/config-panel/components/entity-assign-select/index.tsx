import React, { useLayoutEffect } from 'react';
import { Button, IconButton } from '@mui/material';
import { isEqual } from 'lodash-es';
import { useDynamicList, useControllableValue } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { DeleteOutlineIcon, AddIcon } from '@milesight/shared/src/components';
import EntitySelect from '../entity-select';
import ParamInputSelect from '../param-input-select';
import './style.less';

export type EntityAssignInputValueType =
    | NonNullable<AssignerNodeDataType['parameters']>['exchangePayload']
    | undefined;
export type EntityAssignInputInnerValueType = [string, string] | undefined;

export interface EntityAssignSelectProps {
    label?: string[];
    required?: boolean;
    multiple?: boolean;
    error?: boolean;
    helperText?: React.ReactNode;
    value?: EntityAssignInputValueType;
    defaultValue?: EntityAssignInputValueType;
    onChange?: (value: EntityAssignInputValueType) => void;
}

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
    ...props
}) => {
    const { getIntlText } = useI18n();
    const [data, setData] = useControllableValue<EntityAssignInputValueType>(props);
    const { list, remove, getKey, insert, replace, resetList } =
        useDynamicList<EntityAssignInputInnerValueType>(Object.entries(data || {}));

    useLayoutEffect(() => {
        if (isEqual(data, arrayToObject(list))) return;
        resetList(Object.entries(data || {}));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, resetList]);

    useLayoutEffect(() => {
        setData?.(arrayToObject(list));
    }, [list, setData]);

    return (
        <div className="ms-entity-assign-select">
            {list.map((item, index) => (
                <div className="ms-entity-assign-select-item" key={getKey(index)}>
                    <EntitySelect
                        value={item?.[0] || ''}
                        onChange={value => {
                            replace(index, [`${value || ''}`, item?.[1] || '']);
                        }}
                        dropdownMatchSelectWidth={400}
                    />
                    <ParamInputSelect
                        value={item?.[1]}
                        onChange={data => {
                            replace(index, [item?.[0] || '', data || '']);
                        }}
                    />
                    <IconButton onClick={() => remove(index)}>
                        <DeleteOutlineIcon />
                    </IconButton>
                </div>
            ))}
            {multiple && (
                <Button
                    fullWidth
                    variant="outlined"
                    className="ms-entity-assign-select-add-btn"
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
