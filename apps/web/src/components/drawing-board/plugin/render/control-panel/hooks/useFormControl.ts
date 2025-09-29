import { useEffect, useRef } from 'react';
import { useForm, type SubmitHandler, useWatch } from 'react-hook-form';
import { isEmpty, isEqual, isPlainObject } from 'lodash-es';
import { useMemoizedFn } from 'ahooks';

import useControlPanelStore from '@/components/drawing-board/plugin/store';

export interface UseFormControlProps {
    /**
     * Form data submission
     */
    onOk?: (data: AnyDict) => void;
}

/**
 * Form data control
 */
export function useFormControl(props: UseFormControlProps) {
    const { onOk } = props || {};

    const { control, handleSubmit, reset, getValues, setValue, getFieldState } = useForm<AnyDict>();
    const newFormValues = useWatch({
        control,
    });
    const { formData, updateFormData, registerConfigUpdateEffect } = useControlPanelStore();
    const watchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    /**
     * Handle Form submit
     */
    const onSubmit: SubmitHandler<AnyDict> = params => {
        onOk?.(params);
    };

    const handleDataChange = useMemoizedFn((newData: AnyDict) => {
        if (watchTimeoutRef.current) {
            clearTimeout(watchTimeoutRef.current);
        }

        watchTimeoutRef.current = setTimeout(() => {
            if (!isPlainObject(newData) || isEmpty(newData) || isEqual(newData, formData)) {
                return;
            }

            updateFormData(newData);
        }, 150);
    });

    /**
     * To initial data
     */
    useEffect(() => {
        const allValues = getValues();

        /**
         * If the current formData is empty
         * then, get values and update formData
         */
        if (!formData && allValues) {
            updateFormData(allValues);
            return;
        }

        /**
         * If the current formData has values
         * reset it to the current form
         */
        if (formData && !isEqual(formData, allValues)) {
            reset(formData);
        }
    }, [formData, getValues, updateFormData, reset]);

    /**
     * To Register the update config function
     */
    useEffect(() => {
        registerConfigUpdateEffect((newData?: AnyDict, formData?: AnyDict) => {
            if (!newData) return;

            reset({
                ...formData,
                ...newData,
            });
        });
    }, [registerConfigUpdateEffect, reset]);

    /**
     * Handling changes to form values being watched
     */
    useEffect(() => {
        if (!isPlainObject(newFormValues) || isEmpty(newFormValues)) {
            return;
        }

        handleDataChange(newFormValues);
    }, [newFormValues, handleDataChange]);

    /**
     * Control panel destroy
     */
    useEffect(() => {
        return () => {
            /** To initial data */
            updateFormData(undefined);
            registerConfigUpdateEffect(undefined);
        };
    }, [updateFormData, registerConfigUpdateEffect]);

    return {
        control,
        handleSubmit: handleSubmit(onSubmit),
        reset,
        setValue,
        getValues,
        getFieldState,
    };
}
