import { useState } from 'react';
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
            visible
            onCancel={handleClose}
            onOk={handleOk}
            title={getIntlText('common.label.export')}
        >
            <DateRangePicker
                label={{ start: 'Start date', end: 'End date' }}
                onChange={changeTime}
                value={time}
            />
        </Modal>
    );
};

export default ExportModal;
