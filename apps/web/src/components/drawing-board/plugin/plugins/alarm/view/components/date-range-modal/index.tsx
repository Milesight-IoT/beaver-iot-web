import React, { useMemo } from 'react';
import { useForm, Controller, type SubmitHandler, type ControllerProps } from 'react-hook-form';
import { Box, FormControl, FormHelperText, IconButton } from '@mui/material';

import { useI18n, useTime, useTheme } from '@milesight/shared/src/hooks';
import { Modal, toast, type ModalProps, SaveAltIcon } from '@milesight/shared/src/components';
import { checkRequired } from '@milesight/shared/src/utils/validators';

import { DateRangePickerValueType } from '@/components/date-range-picker';
import { DateRangePicker } from '@/components';

interface IProps extends Omit<ModalProps, 'onOk'> {
    onSuccess?: () => void;
}

type FormDataProps = {
    time?: DateRangePickerValueType | null;
};

/**
 * Date Range Picker Modal Component
 */
const DateRangeModal: React.FC<IProps> = ({ onCancel, onSuccess, ...props }) => {
    const { getIntlText } = useI18n();
    const { matchTablet } = useTheme();
    const { timezone, dayjs, getTimeFormat } = useTime();

    const formItems = useMemo<ControllerProps<FormDataProps>[]>(
        () => [
            {
                name: 'time',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        checkDateRange: value => {
                            const pickerTime = value as DateRangePickerValueType;
                            if (!pickerTime?.start || !pickerTime?.end) {
                                return getIntlText('common.tip.select_date_range');
                            }

                            return true;
                        },
                    },
                },
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <FormControl fullWidth>
                            <DateRangePicker
                                closeOnSelect
                                views={['year', 'month', 'day']}
                                viewRenderers={{
                                    hours: null,
                                    minutes: null,
                                    seconds: null,
                                }}
                                value={value as DateRangePickerValueType | null}
                                onChange={onChange}
                                slotProps={{
                                    toolbar: {
                                        hidden: true,
                                    },
                                    tabs: {
                                        hidden: true,
                                    },
                                    actionBar: {
                                        actions: [],
                                    },
                                    textField: {
                                        required: true,
                                        fullWidth: matchTablet,
                                        inputProps: {
                                            readOnly: true,
                                            autoComplete: 'off',
                                            sx: {
                                                userSelect: 'none',
                                            },
                                        },
                                    },
                                    mobilePaper: {
                                        sx: {
                                            '&.MuiPaper-root.MuiDialog-paper .MuiDialogContent-root':
                                                {
                                                    minWidth: '320px !important',
                                                },
                                        },
                                    },
                                }}
                                hasError={Boolean(error)}
                            />
                            {error && <FormHelperText error>{error.message}</FormHelperText>}
                        </FormControl>
                    );
                },
            },
        ],
        [getIntlText, matchTablet],
    );
    const { control, handleSubmit } = useForm<FormDataProps>({
        shouldUnregister: true,
    });
    const handleOk: SubmitHandler<FormDataProps> = async ({ time }) => {
        console.log('handleOk ? ', time);

        onCancel?.();
        onSuccess?.();
        toast.success(getIntlText('common.message.operation_success'));
    };

    return (
        <Modal
            {...props}
            size="lg"
            title={getIntlText('common.label.custom')}
            onCancel={onCancel}
            onOk={handleSubmit(handleOk)}
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
                {formItems.map(props => (
                    <Controller<FormDataProps> {...props} key={props.name} control={control} />
                ))}
            </Box>
        </Modal>
    );
};

export default DateRangeModal;
