/**
 * Param Input Component
 *
 * Note: use in TriggerNode, CodeNode
 */
import { useLayoutEffect, useMemo } from 'react';
import {
    Select,
    Button,
    IconButton,
    FormControl,
    MenuItem,
    TextField,
    Switch,
    InputLabel,
    type SelectProps,
    type TextFieldProps,
} from '@mui/material';
import { useDynamicList, useControllableValue } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { genRandomString } from '@milesight/shared/src/utils/tools';
import { DeleteOutlineIcon, AddIcon } from '@milesight/shared/src/components';
import './style.less';
import { isEqual } from 'lodash-es';

export type ParamInputValueType = NonNullable<
    TriggerNodeDataType['parameters']
>['entityConfigs'][0] & {
    context?: boolean;
};

export interface ParamInputProps {
    required?: boolean;
    disabled?: boolean;
    defaultValue?: ParamInputValueType[];
    showSwitch?: boolean;
    typeSelectProps?: SelectProps;
    nameInputProps?: TextFieldProps;
    maxAddNum?: number;
    value?: ParamInputValueType[];
    onChange?: (value: ParamInputValueType[]) => void;
}

const DEFAULT_EMPTY_VALUE: ParamInputValueType = {
    identify: '',
    name: '',
    type: '' as EntityValueDataType,
};
const typeOptions = [
    {
        label: 'INT',
        value: 'LONG',
    },
    {
        label: 'FLOAT',
        value: 'DOUBLE',
    },
    {
        label: 'BOOLEAN',
        value: 'BOOLEAN',
    },
    {
        label: 'STRING',
        value: 'STRING',
    },
];
const ParamInput: React.FC<ParamInputProps> = ({
    required,
    disabled,
    defaultValue,
    showSwitch,
    typeSelectProps,
    nameInputProps,
    maxAddNum,
    ...props
}) => {
    const { getIntlText } = useI18n();
    const [innerValue, setInnerValue] = useControllableValue<ParamInputValueType[]>(props);
    const { list, remove, getKey, insert, replace, resetList } =
        useDynamicList<ParamInputValueType>(innerValue || []);
    useLayoutEffect(() => {
        if (isEqual(innerValue, list)) return;
        resetList(innerValue || []);
    }, [innerValue, resetList]);
    useLayoutEffect(() => {
        setInnerValue?.(list);
    }, [list, setInnerValue]);

    const handleChange = (
        index: number,
        rowItem: ParamInputValueType,
        key: string,
        value: string | boolean,
    ) => {
        replace(index, { ...rowItem, [key]: value });
    };
    const disabledAdd = useMemo(() => {
        return maxAddNum !== undefined && Number.isInteger(maxAddNum) && list.length >= maxAddNum;
    }, [list]);
    const handlerAdd = () => {
        if (disabledAdd) return;
        insert(list.length, {
            ...DEFAULT_EMPTY_VALUE,
            identify: `param_${genRandomString(8, { lowerCase: true })}`,
        });
    };
    return (
        <div className="ms-param-input">
            {list.map((item, index) => (
                <div className="ms-param-input-item" key={getKey(index) || index}>
                    <FormControl required={required} disabled={disabled}>
                        <TextField
                            label={nameInputProps?.label || getIntlText('common.label.name')}
                            value={item.name}
                            onChange={e =>
                                handleChange(index, item, 'name', e.target.value as string)
                            }
                        />
                    </FormControl>
                    <FormControl required={required} disabled={disabled}>
                        <InputLabel id="param-input-type-label">
                            {typeSelectProps?.label || getIntlText('common.label.type')}
                        </InputLabel>
                        <Select
                            notched
                            labelId="param-input-type-label"
                            label={typeSelectProps?.label || getIntlText('common.label.type')}
                            value={item.type}
                            onChange={e =>
                                handleChange(index, item, 'type', e.target.value as string)
                            }
                        >
                            {typeOptions.map(item => (
                                <MenuItem key={item.value} value={item.value}>
                                    {item.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {showSwitch && (
                        <FormControl
                            className="ms-param-output-switch"
                            required={required}
                            disabled={disabled}
                        >
                            <Switch
                                checked={!!item?.context}
                                onChange={e =>
                                    handleChange(
                                        index,
                                        item,
                                        'context',
                                        e.target.checked as boolean,
                                    )
                                }
                            />
                            <span className="ms-param-output-switch-label">
                                {getIntlText('workflow.node.trigger_switch_label')}
                            </span>
                        </FormControl>
                    )}
                    <IconButton onClick={() => remove(index)}>
                        <DeleteOutlineIcon />
                    </IconButton>
                </div>
            ))}
            <Button
                fullWidth
                variant="outlined"
                className="ms-param-input-add-btn"
                startIcon={<AddIcon />}
                disabled={disabledAdd}
                onClick={handlerAdd}
            >
                {getIntlText('common.label.add')}
            </Button>
        </div>
    );
};

export default ParamInput;
