import React, { memo, useEffect, useLayoutEffect } from 'react';
import { Button, IconButton } from '@mui/material';
import { isEqual } from 'lodash-es';
import { useDynamicList, useControllableValue } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { AddIcon, CloseIcon } from '@milesight/shared/src/components';
import { TagSelect } from '@/components';
import './style.less';

export type TagMultipleSelectValueType = ApiKey;

export interface TagMultipleSelectProps {
    required?: boolean;
    disabled?: boolean;
    multiple?: boolean;
    value?: TagMultipleSelectValueType[];
    defaultValue?: TagMultipleSelectValueType[];
    onChange?: (value: TagMultipleSelectValueType[]) => void;
}

const MAX_VALUE_LENGTH = 10;

/**
 * Tag Multiple Select Component
 */
const TagMultipleSelect: React.FC<TagMultipleSelectProps> = ({
    required,
    disabled,
    multiple = true,
    ...props
}) => {
    const { getIntlText } = useI18n();
    const [innerValue, setInnerValue] = useControllableValue<TagMultipleSelectValueType[]>(props);
    const { list, remove, getKey, insert, replace, resetList } =
        useDynamicList<TagMultipleSelectValueType>(innerValue || []);

    useLayoutEffect(() => {
        if (isEqual(innerValue, list)) return;
        resetList(innerValue || ['']);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [innerValue, resetList]);

    useEffect(() => {
        setInnerValue?.(list || ['']);
    }, [list, setInnerValue]);

    return (
        <div className="ms-tag-multiple-select">
            {list.map((item, index) => (
                <div className="ms-tag-multiple-select-item" key={getKey(index) || index}>
                    <TagSelect
                        size="small"
                        value={{ id: item }}
                        onChange={(_, value) => {
                            replace(
                                index,
                                !value ? '' : typeof value === 'object' ? value.id : value,
                            );
                        }}
                    />
                    {list.length > 1 && (
                        <IconButton className="btn-delete" onClick={() => remove(index)}>
                            <CloseIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    )}
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
                        insert(list.length, '');
                    }}
                >
                    {getIntlText('common.label.add')}
                </Button>
            )}
        </div>
    );
};

export default memo(TagMultipleSelect) as typeof TagMultipleSelect;
