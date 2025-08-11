import { useState } from 'react';
import { Box } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal } from '@milesight/shared/src/components';
import { DateRangePickerValueType } from '@/components/date-range-picker';
import { DateRangePicker } from '@/components';

interface IProps {
    onCancel: () => void;
    onOk: (data: DateRangePickerValueType | null) => void;
}

const ExportModal = (props: IProps) => {
    const { getIntlText } = useI18n();
    const { onOk, onCancel } = props;
    const [time, setTime] = useState<DateRangePickerValueType | null>(null);

    const handleClose = () => {
        onCancel();
    };

    const handleOk = () => {
        onOk(time);
    };

    const changeTime = (values: DateRangePickerValueType | null) => {
        setTime(values);
    };

    return (
        <Modal
            size="lg"
            visible
            onCancel={handleClose}
            onOk={handleOk}
            title={getIntlText('common.label.export')}
        >
            <Box
                sx={{
                    '&  .MuiFormControl-root': {
                        marginBottom: 0,
                    },
                    '&  .MuiBox-root': {
                        mt: 3,
                    },
                }}
            >
                <DateRangePicker
                    label={{
                        start: getIntlText('common.label.start_date'),
                        end: getIntlText('common.label.end_date'),
                    }}
                    onChange={changeTime}
                    value={time}
                />
            </Box>
        </Modal>
    );
};

export default ExportModal;
