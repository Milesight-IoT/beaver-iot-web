import React, { useState, useMemo } from 'react';
import { type Dayjs } from 'dayjs';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTimePicker, DateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker';

import { useI18n, useTheme } from '@milesight/shared/src/hooks';

export type DateRangePickerValueType = {
    start?: Dayjs | null;
    end?: Dayjs | null;
};

type ViewsType = 'year' | 'month' | 'day' | 'hours' | 'minutes';

interface DateRangePickerProps
    extends Omit<DateTimePickerProps<Dayjs>, 'value' | 'label' | 'onChange' | 'views'> {
    value?: DateRangePickerValueType | null;
    label?: {
        start?: React.ReactNode;
        end?: React.ReactNode;
    };
    onChange?: (value: DateRangePickerValueType | null) => void;
    views?: ViewsType[];
    hasError?: boolean;
    startMinDateTime?: Dayjs;
    endMaxDateTime?: Dayjs;
}

/**
 * Common slot props for DateTimePicker.
 */
const commonSlotProps: DateTimePickerProps<Dayjs>['slotProps'] = {
    popper: {
        modifiers: [
            {
                name: 'preventOverflow',
                options: {
                    mainAxis: true,
                    altAxis: true,
                },
            },
        ],
    },
};

const DateRangePicker: React.FC<DateRangePickerProps> = ({
    label,
    value,
    onChange,
    slotProps,
    hasError,
    startMinDateTime,
    endMaxDateTime,
    ...props
}) => {
    const { getIntlText } = useI18n();
    const { matchTablet } = useTheme();

    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);

    const DateRangePickerStyled = useMemo(() => {
        return styled('div')(() => ({
            display: 'flex',
            flexDirection: matchTablet ? 'column' : 'row',
            alignItems: matchTablet ? 'flex-start' : 'center',
            '& .MuiFormControl-root': {
                flex: 1,
            },
            marginBottom: matchTablet ? '16px' : undefined,
            '& .MuiFormControl-root:last-child': {
                paddingTop: matchTablet ? undefined : '26px',
            },
            '& .MuiFormControl-root.MuiFormControl-marginDense': {
                marginBottom: matchTablet ? '12px' : undefined,
            },
        }));
    }, [matchTablet]);

    return (
        <DateRangePickerStyled>
            <DateTimePicker
                ampm={false}
                label={getIntlText('common.label.date_range')}
                value={value?.start || startDate}
                closeOnSelect={false}
                slotProps={{
                    ...commonSlotProps,
                    ...{
                        ...slotProps,
                        textField: {
                            error: Boolean(!value?.start && hasError),
                            placeholder: getIntlText('common.label.start_date'),
                            ...slotProps?.textField,
                        },
                    },
                }}
                onChange={start => {
                    // Passing onChange indicates that it is controlled, and no internal value handling is done.
                    if (onChange) {
                        onChange({
                            start,
                            end: value?.end || endDate,
                        });
                    } else {
                        setStartDate(start);
                    }
                }}
                minDateTime={startMinDateTime}
                maxDateTime={value?.end || undefined}
                {...props}
            />
            {!matchTablet && <Box sx={{ mx: 1, color: 'text.secondary' }}> — </Box>}
            <DateTimePicker
                ampm={false}
                value={value?.end || endDate}
                closeOnSelect={false}
                slotProps={{
                    ...commonSlotProps,
                    ...{
                        ...slotProps,
                        textField: {
                            error: Boolean(!value?.end && hasError),
                            placeholder: getIntlText('common.label.end_date'),
                            ...slotProps?.textField,
                        },
                    },
                }}
                onChange={end => {
                    // Passing onChange indicates that it is controlled, and no internal value handling is done.
                    if (onChange) {
                        onChange({
                            start: value?.start || startDate,
                            end,
                        });
                    } else {
                        setEndDate(end);
                    }
                }}
                minDateTime={value?.start || undefined}
                maxDateTime={endMaxDateTime}
                {...props}
            />
        </DateRangePickerStyled>
    );
};

export default DateRangePicker;
