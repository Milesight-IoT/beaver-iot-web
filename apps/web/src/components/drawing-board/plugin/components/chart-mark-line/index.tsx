import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Button, IconButton, FormHelperText, TextField, Checkbox } from '@mui/material';
import { isEqual } from 'lodash-es';
import { useDynamicList, useControllableValue } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { DeleteOutlineIcon, AddIcon } from '@milesight/shared/src/components';
import IconColorSelect from '../icon-color-select';
import { extractAndValidateNumber } from '../../utils';
import styles from './style.module.less';

export interface ChartMarkLineValueType {
    id: ApiKey;
    label: string; // 标签名称
    value: number | string; // 刻度值
    unit: string; // 单位
    color: string; // 颜色
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
    const [showContent, setShowContent] = useState(Boolean(data?.length));
    const { list, remove, getKey, insert, replace, resetList } =
        useDynamicList<ChartMarkLineValueType>(data);

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
                        setShowContent(e.target.checked);
                        resetList(e.target.checked ? [defaultMarkLine] : []);
                    }}
                />
                {getIntlText('common.label.mark_line')}
            </div>
            {showContent && (
                <div className={styles['list-content']}>
                    {list.map((item, index) => (
                        <div className={styles.item} key={getKey(index)}>
                            {/* Label 输入框 */}
                            <TextField
                                required={required}
                                label={getIntlText('common.label.label')}
                                value={item?.label || ''}
                                slotProps={{ htmlInput: { maxLength: 35 } }}
                                onChange={e => {
                                    replace(index, {
                                        ...item,
                                        label: e.target.value,
                                    });
                                }}
                                sx={{ flex: 1 }}
                            />
                            {/* 刻度输入框 */}
                            <TextField
                                required={required}
                                classes={{ root: 'input-box' }}
                                label={getIntlText('common.label.scale')}
                                value={item?.value || ''}
                                onChange={e => {
                                    // 在输入过程中不做任何过滤，允许用户自由输入
                                    replace(index, {
                                        ...item,
                                        value: e.target.value,
                                    });
                                }}
                                onBlur={e => {
                                    const inputValue = e.target.value;
                                    // 如果为空，不做处理
                                    if (!inputValue.trim()) {
                                        return;
                                    }
                                    // 使用工具函数提取并验证数字
                                    const validatedValue = extractAndValidateNumber(inputValue);
                                    // 更新为验证后的值（可能是数字或空字符串）
                                    replace(index, {
                                        ...item,
                                        value: validatedValue ?? '',
                                    });
                                }}
                                sx={{ width: '60px' }}
                            />
                            {/* 单位输入框 */}
                            <TextField
                                label={getIntlText('common.label.unit')}
                                classes={{ root: 'input-box' }}
                                slotProps={{ htmlInput: { maxLength: 10 } }}
                                value={item?.unit || ''}
                                onChange={e => {
                                    replace(index, {
                                        ...item,
                                        unit: e.target.value,
                                    });
                                }}
                                sx={{ width: '60px' }}
                            />
                            {/* 颜色选择器 */}
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

                            {/* 删除按钮 */}
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
            )}
            <FormHelperText error={Boolean(error)}>{helperText}</FormHelperText>
        </div>
    );
};

export default ChartMarkLine;
