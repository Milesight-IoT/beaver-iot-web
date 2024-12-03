import React, { useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker';

type DateRangePickerValueType = {
    start?: Dayjs;
    end?: Dayjs;
};

interface DateRangePickerProps extends Omit<DatePickerProps<Dayjs>, 'value' | 'label'> {
    value?: DateRangePickerValueType | null;
    label?: {
        start?: React.ReactNode;
        end?: React.ReactNode;
    };
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
            <DatePicker
                label={label?.start}
                value={startDate}
                onChange={start => {
                    setStartDate(start);
                }}
                {...props}
            />
            <Box sx={{ mx: 2 }}> — </Box>
            <DatePicker
                label={label?.end}
                value={endDate}
                onChange={start => {
                    setEndDate(start);
                }}
                {...props}
            />
        </DateRangePickerStyled>
    );
};

export default DateRangePicker;
