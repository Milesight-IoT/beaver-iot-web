import React, { useMemo, useLayoutEffect } from 'react';
import { useDynamicList, useControllableValue } from 'ahooks';
import { isEqual } from 'lodash-es';
import {
    Select,
    FormControl,
    InputLabel,
    MenuItem,
    Button,
    IconButton,
    Stack,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import { AddIcon, DeleteOutlineIcon } from '@milesight/shared/src/components';
import './style.less';

export type TimerInputValueType = Partial<
    NonNullable<TimerNodeDataType['parameters']>['timerSettings']
>;

export interface TimerInputProps {
    // label?: string;

    required?: boolean;

    /**
     * Param Select Placeholder
     */
    // placeholder?: string;

    value?: TimerInputValueType;

    defaultValue?: TimerInputValueType;

    onChange?: (value: TimerInputValueType) => void;
}

const timerTypeConfigs: Record<
    NonNullable<TimerInputValueType['type']>,
    {
        labelIntlKey: string;
    }
> = {
    ONCE: {
        labelIntlKey: 'workflow.editor.form_param_timer_type_once',
    },
    SCHEDULE: {
        labelIntlKey: 'workflow.editor.form_param_timer_type_cycle',
    },
};

const periodConfigs: Record<
    TimePeriodType,
    {
        labelIntlKey: string;
    }
> = {
    EVERYDAY: {
        labelIntlKey: 'workflow.editor.form_param_timer_period_everyday',
    },
    MONDAY: {
        labelIntlKey: 'workflow.editor.form_param_timer_period_monday',
    },
    TUESDAY: {
        labelIntlKey: 'workflow.editor.form_param_timer_period_tuesday',
    },
    WEDNESDAY: {
        labelIntlKey: 'workflow.editor.form_param_timer_period_wednesday',
    },
    THURSDAY: {
        labelIntlKey: 'workflow.editor.form_param_timer_period_thursday',
    },
    FRIDAY: {
        labelIntlKey: 'workflow.editor.form_param_timer_period_friday',
    },
    SATURDAY: {
        labelIntlKey: 'workflow.editor.form_param_timer_period_saturday',
    },
    SUNDAY: {
        labelIntlKey: 'workflow.editor.form_param_timer_period_sunday',
    },
};

const MAX_VALUE_LENGTH = 10;

/**
 * Timer Input Component
 *
 * Note: use in TimerNode
 */
const TimerInput: React.FC<TimerInputProps> = ({ required, ...props }) => {
    const { getIntlText } = useI18n();
    const { timezone, getTime } = useTime();
    const [data, setData] = useControllableValue<TimerInputValueType | undefined>(props);
    const { list, remove, getKey, insert, replace, resetList } = useDynamicList<
        Partial<NonNullable<TimerInputValueType['rules']>[number]>
    >(data?.rules);
    const typeOptions = useMemo(() => {
        return Object.entries(timerTypeConfigs).map(([type, config]) => (
            <MenuItem key={type} value={type}>
                {getIntlText(config.labelIntlKey)}
            </MenuItem>
        ));
    }, [getIntlText]);
    const periodOptions = useMemo(() => {
        return Object.entries(periodConfigs).map(([period, config]) => (
            <MenuItem key={period} value={period}>
                {getIntlText(config.labelIntlKey)}
            </MenuItem>
        ));
    }, [getIntlText]);

    useLayoutEffect(() => {
        if (data?.type === 'ONCE' || isEqual(data?.rules, list)) return;
        resetList(data?.rules || []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, resetList]);

    useLayoutEffect(() => {
        setData(d => ({
            ...d,
            rules: list || [],
        }));
    }, [list, setData]);

    return (
        <Stack className="ms-timer-input" spacing={3}>
            <FormControl fullWidth required={required}>
                <InputLabel id="time-input-type-label">
                    {getIntlText('workflow.editor.form_param_timer_type')}
                </InputLabel>
                <Select<TimerInputValueType['type'] | ''>
                    notched
                    labelId="time-input-type-label"
                    label={getIntlText('workflow.editor.form_param_timer_type')}
                    value={data?.type || ''}
                    onChange={e => {
                        const type = e.target.value as TimerInputValueType['type'];
                        setData({ type, timezone, rules: type === 'SCHEDULE' ? [{}] : undefined });
                    }}
                >
                    {typeOptions}
                </Select>
            </FormControl>
            {data?.type === 'ONCE' && (
                <DateTimePicker
                    ampm={false}
                    label={getIntlText('workflow.editor.form_param_execution_time')}
                    value={data.executionEpochSecond ? getTime(data.executionEpochSecond) : null}
                    sx={{ width: '100%' }}
                    onChange={time => {
                        setData({
                            ...data,
                            executionEpochSecond: getTime(time, true).valueOf(),
                            rules: undefined,
                            expirationEpochSecond: undefined,
                        });
                    }}
                />
            )}
            {data?.type === 'SCHEDULE' && (
                <>
                    <div className="ms-timer-input-exec-queue">
                        <span className="label">
                            {getIntlText('workflow.editor.form_param_execution_time_queue')}
                        </span>
                        {list.map((item, index) => (
                            <div className="queue-item" key={getKey(index) || index}>
                                <FormControl fullWidth required={required}>
                                    <InputLabel id="time-input-period-label">
                                        {getIntlText('workflow.editor.form_param_timer_type')}
                                    </InputLabel>
                                    <Select
                                        notched
                                        labelId="time-input-period-label"
                                        label={getIntlText('workflow.editor.form_param_timer_type')}
                                        value={item.daysOfWeek?.[0] || ''}
                                        onChange={e => {
                                            replace(index, {
                                                ...item,
                                                daysOfWeek: [e.target.value as TimePeriodType],
                                            });
                                        }}
                                    >
                                        {periodOptions}
                                    </Select>
                                </FormControl>
                                <TimePicker
                                    ampm={false}
                                    sx={{ width: '100%' }}
                                    label={getIntlText('common.label.time')}
                                    value={
                                        item.hour && item.minute
                                            ? getTime(Date.now())
                                                  .hour(item.hour)
                                                  .minute(item.minute)
                                            : null
                                    }
                                    onChange={time => {
                                        const date = getTime(time, true);
                                        replace(index, {
                                            ...item,
                                            hour: date.hour(),
                                            minute: date.minute(),
                                        });
                                    }}
                                />
                                {list.length > 1 && (
                                    <IconButton onClick={() => remove(index)}>
                                        <DeleteOutlineIcon />
                                    </IconButton>
                                )}
                            </div>
                        ))}
                        <Button
                            fullWidth
                            variant="outlined"
                            className="ms-timer-input-exec-queue-add-btn"
                            startIcon={<AddIcon />}
                            disabled={list.length >= MAX_VALUE_LENGTH}
                            onClick={() => {
                                if (list.length >= MAX_VALUE_LENGTH) return;
                                insert(list.length, {});
                            }}
                        >
                            {getIntlText('common.label.add')}
                        </Button>
                    </div>
                    <DateTimePicker
                        ampm={false}
                        label={getIntlText('workflow.editor.form_param_expire_time')}
                        value={
                            data.expirationEpochSecond ? getTime(data.expirationEpochSecond) : null
                        }
                        sx={{ width: '100%' }}
                        onChange={time => {
                            setData({
                                ...data,
                                executionEpochSecond: undefined,
                                expirationEpochSecond: getTime(time, true).valueOf(),
                            });
                        }}
                    />
                </>
            )}
        </Stack>
    );
};

export default TimerInput;
