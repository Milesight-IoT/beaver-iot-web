import { useMemoizedFn } from 'ahooks';
import { type ControllerProps, type ValidationRule } from 'react-hook-form';

import { useI18n } from '@milesight/shared/src/hooks';

/**
 * Handle Form rules
 */
export function useFormRules() {
    const { getIntlText } = useI18n();

    const quickRequired = useMemoizedFn((required?: string | ValidationRule<boolean>) => {
        if (typeof required === 'boolean') {
            return required ? getIntlText('valid.input.required') : required;
        }

        return required;
    });

    const quickMaxOrMin = useMemoizedFn(
        (textKey: string, value?: ValidationRule<string | number>) => {
            if (typeof value === 'string' || typeof value === 'number') {
                return {
                    value,
                    message: getIntlText(textKey, {
                        0: value,
                    }),
                };
            }

            return value;
        },
    );

    const quickMaxOrMinLength = useMemoizedFn(
        (props: { keyIndex: number; textKey: string; value?: ValidationRule<number> }) => {
            const { keyIndex, textKey, value } = props || {};

            if (typeof value === 'number') {
                return {
                    value,
                    message: getIntlText(textKey, {
                        [keyIndex]: value,
                    }),
                };
            }

            return value;
        },
    );

    const processQuickRules = useMemoizedFn(
        (controllerProps: PartialOptional<ControllerProps, 'render'>) => {
            const { rules, ...restProps } = controllerProps || {};

            const { required, max, maxLength, min, minLength, ...restRules } = rules || {};

            return {
                ...restProps,
                rules: {
                    ...restRules,
                    required: quickRequired(required),
                    max: quickMaxOrMin('valid.input.max_value', max),
                    maxLength: quickMaxOrMinLength({
                        keyIndex: 1,
                        textKey: 'valid.input.max_length',
                        value: maxLength,
                    }),
                    min: quickMaxOrMin('valid.input.min_value', min),
                    minLength: quickMaxOrMinLength({
                        keyIndex: 0,
                        textKey: 'valid.input.min_length',
                        value: minLength,
                    }),
                },
            } as PartialOptional<ControllerProps, 'render'>;
        },
    );

    return {
        /**
         * Allows developers to enter simple rules when using common rules(required, min, max ...)
         * automatically helping developers fill in messages
         */
        processQuickRules,
    };
}
