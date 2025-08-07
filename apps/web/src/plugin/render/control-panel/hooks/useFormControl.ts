import { useEffect, useRef } from 'react';
import { useForm, type SubmitHandler, useWatch } from 'react-hook-form';
import { isEmpty, isEqual, isPlainObject } from 'lodash-es';
import { useMemoizedFn } from 'ahooks';

import useControlPanelStore from '@/plugin/store';

import type { AnyDict } from '@/plugin/types';

export interface UseFormControlProps {
    /**
     * Form initial values
     */
    initialValues?: AnyDict;
    /**
     * Form data submission
     */
    onOk?: (data: AnyDict) => void;
    /**
     * Form data change callback
     */
    onChange?: (data: AnyDict) => void;
}

/**
 * Form data control
 */
export function useFormControl(props: UseFormControlProps) {
    const { onOk, onChange, initialValues } = props || {};

    const { control, handleSubmit, reset, getValues } = useForm<AnyDict>();
    const newFormValues = useWatch({
        control,
    });
    const { formData, updateFormData, registerConfigUpdateEffect } = useControlPanelStore();
    const watchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

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

            onChange?.(newData);
            updateFormData(newData);
        }, 300);
    });

    /**
     * To Register the update config function
     */
    useEffect(() => {
        registerConfigUpdateEffect((data?: AnyDict) => {
            if (!data) return;

            onChange?.(data);
            reset?.(data);
        });
    }, [registerConfigUpdateEffect, onChange, reset]);

    /**
     * Handle control panel initial value
     */
    useEffect(() => {
        const allValues = getValues();
        /**
         * When there is no initial value
         * use the form default value as the initial value
         */
        if (!initialValues) {
            handleDataChange(allValues);
            return;
        }

        /**
         * If there is an initial value and it is different from
         * the current form value, then update it
         */
        if (
            !isPlainObject(initialValues) ||
            isEmpty(initialValues) ||
            isEqual(allValues, initialValues)
        ) {
            return;
        }

        reset(initialValues);
    }, [initialValues, getValues, reset, handleDataChange]);

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
    };
}
