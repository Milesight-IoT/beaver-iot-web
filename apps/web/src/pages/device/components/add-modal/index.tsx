import React, { useState, useEffect } from 'react';
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
import { FixedGroupEnum } from '../../constants';
import useDeviceStore from '../../store';

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
    const { activeGroup } = useDeviceStore();

    // ---------- Integrates related logic processing ----------
    const [loading, setLoading] = useState<boolean>();
    const [inteID, setInteID] = useState<ApiKey>('');
    const { data: inteList } = useRequest(
        async () => {
            if (!visible) return;
            setLoading(true);
            const [error, resp] = await awaitWrap(integrationAPI.getList({ device_addable: true }));
            const respData = getResponseData(resp);

            setLoading(false);
            if (error || !respData || !isRequestSuccess(resp)) return;
            const data = objectToCamelCase(respData);

            setInteID(respData[0]?.id);
            return data;
        },
        { debounceWait: 300, refreshDeps: [visible] },
    );

    // ---------- Entity form related logical processing ----------
    const { control, formState, handleSubmit, reset, setValue } = useForm<FormDataProps>();
    const { data: entities } = useRequest(
        async () => {
            if (!inteID) return;
            const [error, resp] = await awaitWrap(integrationAPI.getDetail({ id: inteID }));
            const respData = getResponseData(resp);

            if (error || !respData || !isRequestSuccess(resp)) return;

            const {
                add_device_service_key: addDeviceKey,
                integration_entities: integrationEntities,
            } = respData;
            const list = integrationEntities
                ?.map(item => {
                    const data = objectToCamelCase(item);

                    if (data.valueAttribute.enum) {
                        data.valueAttribute.enum = item.value_attribute.enum;
                    }

                    return data;
                })
                .filter(item => `${item.key}`.includes(`${addDeviceKey}`));

            return list;
        },
        {
            debounceWait: 300,
            refreshDeps: [inteID],
        },
    );
    const { formItems, decodeFormParams } = useDynamicFormItems({ entities });
    const onSubmit: SubmitHandler<FormDataProps> = async ({ name, group, location, ...params }) => {
        const entityParams = decodeFormParams(params);

        const [error, resp] = await awaitWrap(
            deviceAPI.addDevice({
                name,
                location,
                group_name: group,
                integration: inteID,
                param_entities: entityParams,
            }),
        );

        if (error || !isRequestSuccess(resp)) {
            onError?.(error);
            return;
        }

        reset();
        setValue('group', null);
        setInteID('');
        onSuccess?.();
        toast.success(getIntlText('common.message.add_success'));
    };

    const handleCancel = useMemoizedFn(() => {
        reset();
        setInteID('');
        onCancel?.();
    });

    useEffect(() => {
        if (!visible || loading !== false || !activeGroup) return;

        /** set group form item default value */
        const defaultValue = [FixedGroupEnum.ALL, FixedGroupEnum.UNGROUPED].includes(
            activeGroup.id as FixedGroupEnum,
        )
            ? undefined
            : activeGroup.name;

        setValue('group', defaultValue);

        return () => {
            reset();
            setLoading(undefined);
        };
    }, [visible, loading, activeGroup, reset, setValue]);

    return (
        <Modal
            size="lg"
            visible={visible}
            title={getIntlText('common.label.add')}
            className={cls({ loading: formState.isSubmitting })}
            onOk={handleSubmit(onSubmit)}
            onCancel={handleCancel}
            okButtonProps={{ disabled: loading !== false }}
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
