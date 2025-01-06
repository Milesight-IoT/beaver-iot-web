import React, { useLayoutEffect } from 'react';
import { Button, IconButton, TextField } from '@mui/material';
import { isEqual } from 'lodash-es';
import { useDynamicList, useControllableValue } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { DeleteOutlineIcon, AddIcon } from '@milesight/shared/src/components';
import ParamInputSelect from '../param-input-select';
import './style.less';

export type ParamAssignInputValueType =
    | NonNullable<CodeNodeDataType['parameters']>['inputArguments']
    | undefined;

export type ParamAssignInputInnerValueType = [string, string] | undefined;

export interface ParamAssignInputProps {
    label?: string[];
    required?: boolean;
    multiple?: boolean;
    error?: boolean;
    helperText?: React.ReactNode;
    value?: ParamAssignInputValueType;
    defaultValue?: ParamAssignInputValueType;
    onChange?: (value: ParamAssignInputValueType) => void;
}

const MAX_VALUE_LENGTH = 10;

const arrayToObject = (arr: ParamAssignInputInnerValueType[]) => {
    const result: ParamAssignInputValueType = {};
    arr?.forEach(item => {
        if (!item) return;
        result[item[0]] = item[1];
    });
    return result;
};

/**
 * Param Assignment Input Component
 *
 * Note: use in CodeNode
 */
const ParamAssignInput: React.FC<ParamAssignInputProps> = ({
    label,
    required = true,
    multiple = true,
    ...props
}) => {
    const { getIntlText } = useI18n();
    const [data, setData] = useControllableValue<ParamAssignInputValueType>(props);
    const { list, remove, getKey, insert, replace, resetList } =
        useDynamicList<ParamAssignInputInnerValueType>(Object.entries(data || {}));

    useLayoutEffect(() => {
        if (isEqual(data, arrayToObject(list))) return;
        resetList(Object.entries(data || {}));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, resetList]);

    useLayoutEffect(() => {
        setData?.(arrayToObject(list));
    }, [list, setData]);

    return (
        <div className="ms-param-assign-input">
            {list.map((item, index) => (
                <div className="ms-param-assign-input-item" key={getKey(index) || index}>
                    <TextField
                        autoComplete="off"
                        label={label?.[0] || getIntlText('common.label.name')}
                        required={required}
                        value={item?.[0] || ''}
                        onChange={e => replace(index, [e.target.value, item?.[1] || ''])}
                    />
                    <ParamInputSelect
                        label={label?.[1]}
                        required={required}
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
                    className="ms-param-assign-input-add-btn"
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

export default ParamAssignInput;
