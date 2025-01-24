import { useMemo } from 'react';
import { type ControllerProps } from 'react-hook-form';
import { TextField } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { checkRequired } from '@milesight/shared/src/utils/validators';
import { type IntegrationAPISchema } from '@/services/http';
import { useEntityFormItems } from '@/hooks';

interface Props {
    entities?: ObjectToCamelCase<
        IntegrationAPISchema['getDetail']['response']['integration_entities']
    >;
}

/**
 * Form data type
 */
export type FormDataProps = Record<string, any>;

/**
 * Add a device dynamic list entry
 */
const useDynamicFormItems = ({ entities }: Props) => {
    const { getIntlText } = useI18n();
    const { formItems: entityFormItems, decodeFormParams } = useEntityFormItems({
        entities,
        isAllRequired: true,
    });

    const formItems = useMemo(() => {
        const result: ControllerProps<FormDataProps>[] = [];

        if (!entityFormItems?.length) return result;

        result.push({
            name: 'name',
            rules: {
                validate: { checkRequired: checkRequired() },
            },
            defaultValue: '',
            render({ field: { onChange, value }, fieldState: { error } }) {
                return (
                    <TextField
                        required
                        fullWidth
                        type="text"
                        label={getIntlText('common.label.name')}
                        error={!!error}
                        helperText={error ? error.message : null}
                        value={value}
                        onChange={onChange}
                    />
                );
            },
        });

        return [...result, ...entityFormItems];
    }, [entityFormItems, getIntlText]);

    return { formItems, decodeFormParams };
};

export default useDynamicFormItems;
