import { useRef } from 'react';
import * as React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';

const BasicDateTimePicker: React.FC<{
    playbackEntity: any;
    onSuccess: (data: any) => void;
}> = props => {
    const dateTimePickerRef = useRef<any>(null);

    const { onSuccess, ...rest } = props;

    // 设置该日期组件，不能选择当前时间之后的未来，以及限定在一个月以内，并且可以清空时间
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
                ref={dateTimePickerRef}
                onAccept={onSuccess}
                minDateTime={dayjs().add(-1, 'month')}
                maxDateTime={dayjs()}
                {...rest}
            />
        </LocalizationProvider>
    );
};

export default BasicDateTimePicker;
