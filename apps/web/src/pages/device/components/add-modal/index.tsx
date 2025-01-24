import React, { useState } from 'react';
import { useRequest, useMemoizedFn } from 'ahooks';
import cls from 'classnames';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { Modal, toast, type ModalProps } from '@milesight/shared/src/components';
import {
    integrationAPI,
    deviceAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
} from '@/services/http';
import useDynamicFormItems, { type FormDataProps } from './useDynamicFormItems';

interface Props extends Omit<ModalProps, 'onOk'> {
    /** Add a failed callback */
    onError?: (err: any) => void;

    /** Adding a successful callback */
    onSuccess?: () => void;
}

/**
 * The device added a pop-up window
 */
const AddModal: React.FC<Props> = ({ visible, onCancel, onError, onSuccess, ...props }) => {
    const { getIntlText } = useI18n();

    // ---------- Integrates related logic processing ----------
    const [inteID, setInteID] = useState<ApiKey>('');
    const { data: inteList } = useRequest(
        async () => {
            if (!visible) return;
            const [error, resp] = await awaitWrap(integrationAPI.getList({ device_addable: true }));
            const respData = getResponseData(resp);

            if (error || !respData || !isRequestSuccess(resp)) return;
            const data = objectToCamelCase(respData);

            setInteID(respData[0]?.id);
            return data;
        },
        { debounceWait: 300, refreshDeps: [visible] },
    );

    // ---------- Entity form related logical processing ----------
    const { control, formState, handleSubmit, reset } = useForm<FormDataProps>();
    const { data: entities } = useRequest(
        async () => {
            if (!inteID) return;
            const [error, resp] = await awaitWrap(integrationAPI.getDetail({ id: inteID }));
            const respData = getResponseData(resp);

            if (error || !respData || !isRequestSuccess(resp)) return;

            const data = objectToCamelCase(respData);
            const addDeviceKey = data.addDeviceServiceKey;
            const list = data.integrationEntities?.filter(item => {
                return `${item.key}`.includes(`${addDeviceKey}`);
            });

            return list;
        },
        {
            debounceWait: 300,
            refreshDeps: [inteID],
        },
    );
    const { formItems, decodeFormParams } = useDynamicFormItems({ entities });
    const onSubmit: SubmitHandler<FormDataProps> = async ({ name, ...params }) => {
        const entityParams = decodeFormParams(params);

        const [error, resp] = await awaitWrap(
            deviceAPI.addDevice({ name, integration: inteID, param_entities: entityParams }),
        );

        // console.log({ error, resp });
        if (error || !isRequestSuccess(resp)) {
            onError?.(error);
            return;
        }

        reset();
        setInteID('');
        onSuccess?.();
        toast.success(getIntlText('common.message.add_success'));
    };

    const handleCancel = useMemoizedFn(() => {
        reset();
        setInteID('');
        onCancel?.();
    });

    return (
        <Modal
            visible={visible}
            title={getIntlText('common.label.add')}
            className={cls({ loading: formState.isSubmitting })}
            onOk={handleSubmit(onSubmit)}
            onCancel={handleCancel}
            {...props}
        >
            <FormControl fullWidth size="small" sx={{ my: 1.5 }}>
                <InputLabel id="select-label-address">
                    {getIntlText('common.label.integration')}
                </InputLabel>
                <Select
                    label={getIntlText('common.label.integration')}
                    labelId="select-label-address"
                    value={inteID}
                    onChange={e => setInteID(e.target.value as string)}
                >
                    {inteList?.map(item => (
                        <MenuItem key={item.id} value={item.id}>
                            {item.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            {formItems.map(props => (
                <Controller<FormDataProps> {...props} key={props.name} control={control} />
            ))}
        </Modal>
    );
};

export default AddModal;
