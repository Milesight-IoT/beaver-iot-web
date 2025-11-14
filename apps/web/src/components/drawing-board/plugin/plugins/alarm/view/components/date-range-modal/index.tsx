import React, { useMemo, useEffect } from 'react';
import { useForm, Controller, type SubmitHandler, type ControllerProps } from 'react-hook-form';
import { Box, FormControl, FormHelperText } from '@mui/material';
import { type Dayjs } from 'dayjs';

import { useI18n, useTheme } from '@milesight/shared/src/hooks';
import { Modal, toast, type ModalProps } from '@milesight/shared/src/components';
import { checkRequired } from '@milesight/shared/src/utils/validators';

import { DateRangePicker, type DateRangePickerValueType } from '@/components';

interface IProps extends Omit<ModalProps, 'onOk'> {
    timeRange?: DateRangePickerValueType | null;
    setTimeRange?: (value: DateRangePickerValueType | null) => void;
    onSuccess?: (time: DateRangePickerValueType) => void;
}

type FormDataProps = {
    time?: DateRangePickerValueType | null;
};

/**
 * Date Range Picker Modal Component
 */
const DateRangeModal: React.FC<IProps> = ({
    timeRange,
    setTimeRange,
    onCancel,
    onSuccess,
    ...props
}) => {
    const { getIntlText } = useI18n();
    const { matchTablet } = useTheme();

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
                                startMinDateTime={
                                    (value as DateRangePickerValueType | null)?.end
                                        ? (
                                              (value as DateRangePickerValueType).end as Dayjs
                                          ).subtract(1, 'year')
                                        : undefined
                                }
                                endMaxDateTime={
                                    (value as DateRangePickerValueType | null)?.start
                                        ? ((value as DateRangePickerValueType).start as Dayjs).add(
                                              1,
                                              'year',
                                          )
                                        : undefined
                                }
                            />
                            {error && <FormHelperText error>{error.message}</FormHelperText>}
                        </FormControl>
                    );
                },
            },
        ],
        [getIntlText, matchTablet],
    );
    const { control, handleSubmit, setValue } = useForm<FormDataProps>({
        shouldUnregister: true,
    });
    const handleOk: SubmitHandler<FormDataProps> = async ({ time }) => {
        if (!time) {
            return;
        }

        setTimeRange?.(time);
        onCancel?.();
        onSuccess?.(time);
        toast.success(getIntlText('common.message.operation_success'));
    };

    useEffect(() => {
        if (!props?.visible) {
            return;
        }

        setValue('time', timeRange);
    }, [props?.visible, timeRange, setValue]);

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
