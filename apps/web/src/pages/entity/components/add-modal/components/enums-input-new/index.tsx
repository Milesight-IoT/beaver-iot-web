import React, { useEffect, useLayoutEffect } from 'react';
import { TextField, Button, IconButton } from '@mui/material';
import cls from 'classnames';
import { isEqual } from 'lodash-es';
import { useControllableValue, useDynamicList } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { AddIcon, CloseIcon } from '@milesight/shared/src/components';
import './style.less';

interface Props {
    label?: string;
    error?: boolean;
    required?: boolean;
    disabled?: boolean;
    value?: Record<string, string | undefined>;
    onChange?: (value: Props['value']) => void;
}

type InnerValueType = [string, string | undefined] | undefined;

const MAX_VALUE_LENGTH = 10;
const DEFAULT_EMPTY_VALUE: Props['value'] = { '': '' };

const arrayToObject = (arr: InnerValueType[]) => {
    const result: Props['value'] = {};
    arr?.forEach(item => {
        if (!item) return;
        result[item[0]] = item[1];
    });
    return result;
};

/** new enumInput component */
const EnumsInputNew: React.FC<Props> = ({ label, error, required, disabled, ...props }) => {
    const { getIntlText } = useI18n();
    const [data, setData] = useControllableValue<Props['value']>(props);
    const { list, remove, getKey, insert, replace, resetList } = useDynamicList<InnerValueType>(
        Object.entries(data || DEFAULT_EMPTY_VALUE),
    );

    useLayoutEffect(() => {
        if (isEqual(data, arrayToObject(list))) return;
        resetList(Object.entries(data || DEFAULT_EMPTY_VALUE));
        // if add to show two textInput
        if (!data) {
            insert(list.length, ['', '']);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, resetList]);

    useEffect(() => {
        setData?.(arrayToObject(list));
    }, [list, setData]);

    return (
        <div className={cls('ms-enums-input-new', { error, disabled })}>
            <div className="ms-enums-input-new-fields">
                {list.map((item, index) => (
                    <div className="ms-enums-input-new-field" key={getKey(index) || index}>
                        <div className="field-key">
                            <TextField
                                fullWidth
                                autoComplete="off"
                                sx={{ m: 0 }}
                                label={getIntlText('entity.label.enumeration_items')}
                                disabled={disabled}
                                value={item?.[0] || ''}
                                onChange={e => {
                                    const { value } = e.target;
                                    replace(index, [value, value]);
                                }}
                            />
                        </div>
                        {list.length > 1 && (
                            <IconButton
                                className="field-btn-delete"
                                disabled={disabled}
                                onClick={() => remove(index)}
                            >
                                <CloseIcon />
                            </IconButton>
                        )}
                    </div>
                ))}
            </div>
            <div
                className={cls('ms-param-assign-input-add-btn', {
                    'ms-param-assign-input-add-btn-disabled':
                        disabled || list.length >= MAX_VALUE_LENGTH,
                })}
                onClick={() => {
                    if (list.length >= MAX_VALUE_LENGTH || disabled) {
                        return;
                    }

                    insert(list.length, ['', '']);
                }}
            >
                <AddIcon />
                <span>{getIntlText('common.label.add')}</span>
            </div>
        </div>
    );
};

export default EnumsInputNew;
