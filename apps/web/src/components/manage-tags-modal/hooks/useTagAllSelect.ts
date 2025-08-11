import { useState } from 'react';
import { useMemoizedFn } from 'ahooks';
import { isEmpty } from 'lodash-es';
import { type AutocompleteChangeReason, type AutocompleteChangeDetails } from '@mui/material';

import { ALL_OPTION } from '../constants';

/**
 * Handle tags option includes ALL_OPTION
 */
export function useTagAllSelect() {
    const [allIsIndeterminate, setAllIsIndeterminate] = useState(false);

    const convertTagsValue = useMemoizedFn((values: ApiKey[], options: TagProps[]) => {
        if (
            !Array.isArray(values) ||
            isEmpty(values) ||
            !Array.isArray(options) ||
            isEmpty(options)
        ) {
            return values;
        }

        /** Remove ALL_OPTION */
        const pureOptions = options.filter(o => o.id !== ALL_OPTION.value);

        /**
         * If selected all option then
         * add ALL_OPTION.value
         */
        if (values.length === pureOptions.length) {
            return [...values, ALL_OPTION.value];
        }

        return values;
    });

    const convertTagsOnChangeValue = useMemoizedFn(
        (
            newValues: ApiKey[],
            options: TagProps[],
            reason: AutocompleteChangeReason,
            details?: AutocompleteChangeDetails<TagProps>,
        ) => {
            if (
                !Array.isArray(newValues) ||
                isEmpty(newValues) ||
                !Array.isArray(options) ||
                isEmpty(options)
            ) {
                setAllIsIndeterminate(false);
                return newValues;
            }

            /** Remove ALL_OPTION */
            const pureOptions = options.filter(o => o.id !== ALL_OPTION.value);

            /**
             * If selected is ALL_OPTION
             * and ALL_OPTION status is indeterminate
             * then clear all option
             */
            if (allIsIndeterminate && details?.option?.id === ALL_OPTION.value) {
                setAllIsIndeterminate(false);
                return [];
            }

            /**
             * If selected is ALL_OPTION
             * and ALL_OPTION status is not indeterminate and reason is remove
             * then clear all option
             */
            if (
                !allIsIndeterminate &&
                reason === 'removeOption' &&
                details?.option?.id === ALL_OPTION.value
            ) {
                return [];
            }

            /**
             * If selected is ALL_OPTION
             * then return all option expect ALL_OPTION
             */
            if (newValues.includes(ALL_OPTION.value) && details?.option?.id === ALL_OPTION.value) {
                setAllIsIndeterminate(false);
                return pureOptions.map(o => o.id);
            }

            /** Remove ALL_OPTION */
            const pureNewValue = newValues.filter(v => v !== ALL_OPTION.value);

            setAllIsIndeterminate(pureNewValue.length !== pureOptions.length);
            return pureNewValue;
        },
    );

    return {
        /** Whether the tags all option is indeterminate */
        allIsIndeterminate,
        convertTagsValue,
        convertTagsOnChangeValue,
    };
}
