import React, { useState } from 'react';
import { type Dayjs } from 'dayjs';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTimePicker, DateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker';

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
}

const DateRangePickerStyled = styled('div')(() => ({
    display: 'flex',
    alignItems: 'center',
}));

const DateRangePicker: React.FC<DateRangePickerProps> = ({ label, value, onChange, ...props }) => {
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);

    return (
        <DateRangePickerStyled>
            <DateTimePicker
                label={label?.start}
                value={value?.start || startDate}
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
                {...props}
            />
            <Box sx={{ mx: 2 }}> — </Box>
            <DateTimePicker
                label={label?.end}
                value={value?.end || endDate}
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
                {...props}
            />
        </DateRangePickerStyled>
    );
};

export default DateRangePicker;
