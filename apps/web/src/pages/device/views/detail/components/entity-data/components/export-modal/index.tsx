import React, { useMemo } from 'react';
import { useForm, Controller, type SubmitHandler, type ControllerProps } from 'react-hook-form';
import { Box, FormControl, FormHelperText } from '@mui/material';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import { Modal, toast, type ModalProps } from '@milesight/shared/src/components';
import { linkDownload, genRandomString } from '@milesight/shared/src/utils/tools';
// import { checkRequired } from '@milesight/shared/src/utils/validators';
import { DateRangePickerValueType } from '@/components/date-range-picker';
import { DateRangePicker } from '@/components';
import { entityAPI, awaitWrap, isRequestSuccess, getResponseData } from '@/services/http';

interface IProps extends Omit<ModalProps, 'onOk'> {
    ids?: readonly ApiKey[];
    onSuccess?: () => void;
}

type FormDataProps = {
    time?: DateRangePickerValueType | null;
};

/**
 * Entity export modal
 */
const ExportModal: React.FC<IProps> = ({ ids, onCancel, onSuccess, ...props }) => {
    const { getIntlText } = useI18n();
    const { timezone, dayjs, getTimeFormat } = useTime();

    const formItems = useMemo<ControllerProps<FormDataProps>[]>(
        () => [
            {
                name: 'time',
                // rules: {
                //     validate: {
                //         checkRequired: checkRequired(),
                //     },
                // },
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <FormControl fullWidth>
                            <DateRangePicker
                                label={{
                                    start: getIntlText('common.label.start_date'),
                                    end: getIntlText('common.label.end_date'),
                                }}
                                value={value as DateRangePickerValueType | null}
                                onChange={onChange}
                            />
                            {error && <FormHelperText error>{error.message}</FormHelperText>}
                        </FormControl>
                    );
                },
            },
        ],
        [getIntlText],
    );
    const { control, handleSubmit } = useForm<FormDataProps>({
        shouldUnregister: true,
    });
    const handleOk: SubmitHandler<FormDataProps> = async ({ time }) => {
        const [error, resp] = await awaitWrap(
            entityAPI.exportEntityHistory({
                ids: ids as ApiKey[],
                startTime: time?.start?.valueOf(),
                endTime: time?.end?.valueOf(),
                timezone,
            }),
        );
        if (error || !isRequestSuccess(resp)) return;
        const blobData = getResponseData(resp);
        const fileName = `EntityData_${getTimeFormat(dayjs(), 'simpleDateFormat').replace(
            /-/g,
            '_',
        )}_${genRandomString(6, { upperCase: false, lowerCase: true })}.csv`;

        linkDownload(blobData!, fileName);
        onCancel?.();
        onSuccess?.();
        toast.success(getIntlText('common.message.operation_success'));
    };

    return (
        <Modal
            {...props}
            size="lg"
            title={getIntlText('common.label.export')}
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

export default ExportModal;
