import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Button, IconButton, FormHelperText, TextField, Checkbox } from '@mui/material';
import { isEqual } from 'lodash-es';
import { useDynamicList, useControllableValue } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { DeleteOutlineIcon, AddIcon } from '@milesight/shared/src/components';
import { generateUUID } from '@milesight/shared/src/utils/tools';
import IconColorSelect from '../icon-color-select';
import styles from './style.module.less';
import Input from '../input';

export interface ChartMarkLineValueType {
    id: ApiKey;
    label: string; // Label name
    value: number | string; // Scale value
    unit: string; // Unit
    color: string; // Color
}

export interface ChartMarkLineProps {
    label?: string[];
    required?: boolean;
    multiple?: boolean;
    error?: boolean;
    helperText?: React.ReactNode;
    value?: ChartMarkLineValueType[];
    defaultValue?: ChartMarkLineValueType[];
    onChange?: (value: ChartMarkLineValueType[]) => void;
}

interface ChartMarkLineErrorInfo {
    label: Record<string, string>;
    value: Record<string, string>;
    message: string;
}

const MAX_VALUE_LENGTH = 3;

const DEFAULT_COLORS = ['#F13535', '#F77234', '#F7BA1E'];

/**
 * Select the entity and position of the line chart
 *
 * Note: use in line chart multiple y axis
 */
const ChartMarkLine: React.FC<ChartMarkLineProps> = ({
    required,
    multiple = true,
    error,
    helperText,
    ...props
}) => {
    const { getIntlText } = useI18n();
    const [data, setData] = useControllableValue<ChartMarkLineValueType[]>(props);
    const [showContent, setShowContent] = useState(false);
    const { list, remove, getKey, insert, replace, resetList } =
        useDynamicList<ChartMarkLineValueType>(data);
    const errorInfo = useMemo(() => {
        const errorMap: ChartMarkLineErrorInfo = {
            label: {},
            value: {},
            message: '',
        };
        if (!error) {
            return errorMap;
        }
        const [type, index, message] = helperText?.toString().split('__') || [];
        if (type === 'label') {
            return {
                label: { [index]: message },
                value: {},
                message,
            };
        }
        if (type === 'value') {
            return {
                label: {},
                value: { [index]: message },
                message,
            };
        }
        return errorMap;
    }, [error, helperText]);

    useLayoutEffect(() => {
        if (
            isEqual(
                data,
                list.filter(item => Boolean(item.id)),
            )
        ) {
            return;
        }

        resetList(data);
    }, [data, resetList]);

    useEffect(() => {
        setData?.(list.filter(item => Boolean(item.id)));
    }, [list, setData]);

    // When data has value, show content by default. When data is empty, do nothing
    // and only allow manual interaction, because the add button will be displayed even when empty
    useEffect(() => {
        if (!data?.length) {
            return;
        }
        setShowContent(true);
    }, [data]);

    const defaultMarkLine = {
        id: Date.now().toString(),
        label: '',
        value: '',
        unit: '',
        color: DEFAULT_COLORS[0],
    };

    return (
        <div className={styles['chart-mark-line']}>
            <div className={styles.label}>
                <Checkbox
                    checked={showContent}
                    onChange={e => {
                        const isChecked = e.target.checked;
                        setShowContent(isChecked);
                        resetList(isChecked ? [{ ...defaultMarkLine, id: generateUUID() }] : []);
                    }}
                />
                {getIntlText('common.label.mark_line')}
            </div>
            {showContent && (
                <>
                    <div className={styles['list-content']}>
                        {list.map((item, index) => (
                            <div className={styles.item} key={getKey(index)}>
                                {/* Label input field */}
                                <Input
                                    required={required}
                                    label={getIntlText('common.label.label')}
                                    value={item?.label || ''}
                                    error={Boolean(errorInfo.label[index])}
                                    onChange={label => {
                                        replace(index, {
                                            ...item,
                                            label: label as unknown as string,
                                        });
                                    }}
                                    sx={{ flex: 1 }}
                                />
                                {/* Scale value input field */}
                                <Input
                                    required={required}
                                    classes={{ root: 'input-box' }}
                                    label={getIntlText('common.label.scale')}
                                    value={item?.value || ''}
                                    error={Boolean(errorInfo.value[index])}
                                    onChange={e => {
                                        replace(index, {
                                            ...item,
                                            value: e as unknown as string,
                                        });
                                    }}
                                    sx={{ width: '60px' }}
                                />
                                {/* Unit input field */}
                                <Input
                                    label={getIntlText('common.label.unit')}
                                    classes={{ root: 'input-box' }}
                                    slotProps={{ htmlInput: { maxLength: 10 } }}
                                    value={item?.unit || ''}
                                    onChange={unit => {
                                        replace(index, {
                                            ...item,
                                            unit: unit as unknown as string,
                                        });
                                    }}
                                    sx={{ width: '60px' }}
                                />
                                {/* Color picker */}
                                <IconColorSelect
                                    label={getIntlText('common.label.color')}
                                    className={styles['icon-color-select']}
                                    value={item?.color}
                                    onChange={color => {
                                        replace(index, {
                                            ...item,
                                            color,
                                        });
                                    }}
                                    sx={{ width: '60px' }}
                                />

                                {/* Delete button */}
                                <div className={styles.icon}>
                                    <IconButton onClick={() => remove(index)}>
                                        <DeleteOutlineIcon />
                                    </IconButton>
                                </div>
                            </div>
                        ))}
                        {multiple && (
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<AddIcon />}
                                disabled={list.length >= MAX_VALUE_LENGTH}
                                onClick={() => {
                                    if (list.length >= MAX_VALUE_LENGTH) return;
                                    insert(list.length, {
                                        id: Date.now().toString(),
                                        label: '',
                                        value: '',
                                        unit: '',
                                        color: DEFAULT_COLORS[list.length % 3],
                                    });
                                }}
                            >
                                {getIntlText('common.label.add')}
                            </Button>
                        )}
                    </div>
                    <FormHelperText error={Boolean(error)}>{errorInfo.message}</FormHelperText>
                </>
            )}
        </div>
    );
};

export default React.memo(ChartMarkLine);
