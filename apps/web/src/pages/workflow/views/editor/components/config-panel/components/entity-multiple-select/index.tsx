import { memo, useLayoutEffect } from 'react';
import { Button, IconButton, type SelectProps } from '@mui/material';
import { isEqual } from 'lodash-es';
import { useDynamicList, useControllableValue } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { DeleteOutlineIcon, AddIcon } from '@milesight/shared/src/components';
import EntitySelect, { type EntitySelectProps } from '../entity-select';
import './style.less';

export type EntityMultipleSelectValueType = ApiKey;

export interface EntityFilterSelectProps {
    required?: boolean;
    disabled?: boolean;
    multiple?: boolean;
    error?: boolean;
    helperText?: React.ReactNode;
    value?: EntityMultipleSelectValueType[];
    onChange?: (value: EntityMultipleSelectValueType[]) => void;
    typeSelectProps?: SelectProps;
    entitySelectProps?: EntitySelectProps;
}

const MAX_VALUE_LENGTH = 10;

/**
 * Entity Filter Select Component
 */
const EntityMultipleSelect: React.FC<EntityFilterSelectProps> = ({
    required,
    disabled,
    multiple = true,
    error,
    helperText,
    typeSelectProps,
    entitySelectProps,
    ...props
}) => {
    const { getIntlText } = useI18n();
    const [innerValue, setInnerValue] = useControllableValue<EntityMultipleSelectValueType[]>(
        props,
        {
            defaultValue: [],
        },
    );
    const { list, remove, getKey, insert, replace, resetList } =
        useDynamicList<EntityMultipleSelectValueType>(innerValue || []);

    useLayoutEffect(() => {
        if (isEqual(innerValue, list)) return;
        resetList(innerValue || ['']);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [innerValue, resetList]);

    useLayoutEffect(() => {
        setInnerValue?.(list || ['']);
    }, [list, setInnerValue]);

    return (
        <div className="ms-entity-filter-select">
            {list.map((item, index) => (
                <div className="ms-entity-filter-select-item" key={getKey(index) || index}>
                    {/* <FormControl required={required} disabled={disabled}>
                        <InputLabel id="entity-filter-select-type-label">
                            {typeSelectProps?.label || getIntlText('common.label.type')}
                        </InputLabel>
                        <Select<EntityType>
                            notched
                            labelId="entity-filter-select-type-label"
                            label={typeSelectProps?.label || getIntlText('common.label.type')}
                            IconComponent={KeyboardArrowDownIcon}
                            value={item.entityType || ''}
                            onChange={e =>
                                replace(index, {
                                    ...item,
                                    entityType: e.target.value as EntityType,
                                })
                            }
                        >
                            {entityTypes.map(type => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl> */}
                    <EntitySelect
                        label=""
                        placeholder={getIntlText('common.label.entity')}
                        required={required}
                        disabled={disabled}
                        value={item}
                        onChange={value => {
                            replace(index, value);
                        }}
                    />
                    {list.length > 1 && (
                        <IconButton onClick={() => remove(index)}>
                            <DeleteOutlineIcon />
                        </IconButton>
                    )}
                </div>
            ))}
            {multiple && (
                <Button
                    fullWidth
                    variant="outlined"
                    className="ms-entity-filter-select-add-btn"
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

export default memo(EntityMultipleSelect);
