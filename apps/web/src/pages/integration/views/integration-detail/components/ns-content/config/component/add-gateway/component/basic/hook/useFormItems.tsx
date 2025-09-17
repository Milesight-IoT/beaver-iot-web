import { useMemo } from 'react';
import { type ControllerProps, type FieldValues } from 'react-hook-form';
import { TextFieldProps, TextField } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import {
    checkRequired,
    checkMaxLength,
    SNLengthChecker,
} from '@milesight/shared/src/utils/validators';

export interface GatewayBasicType {
    name: string;
    eui: string;
    credential_id?: string;
}

/**
 * Form data type
 */

type ExtendControllerProps<T extends FieldValues> = ControllerProps<T> & {
    /**
     * To Control whether the current component is rendered
     */
    shouldRender?: (data: Partial<T>) => boolean;
};

// form data
const useFormItems = () => {
    const { getIntlText } = useI18n();

    const formItems = useMemo(() => {
        const props: Partial<TextFieldProps> = {
            fullWidth: true,
            type: 'text',
            size: 'small',
            margin: 'dense',
            sx: { my: 1.5 },
        };
        const result: ExtendControllerProps<GatewayBasicType>[] = [];

        result.push(
            {
                name: 'name',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        checkMaxLength: checkMaxLength({ max: 127 }),
                    },
                },
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            {...props}
                            required
                            label={getIntlText('setting.integration.label.gateway_name')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                            onBlur={event => {
                                const newValue = event?.target?.value;
                                onChange(typeof newValue === 'string' ? newValue.trim() : newValue);
                            }}
                        />
                    );
                },
            },
            {
                name: 'eui',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        ...SNLengthChecker(),
                    },
                },
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            {...props}
                            required
                            label={getIntlText('setting.integration.label.device_eui')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
            // {
            //     name: 'credential_id',
            //     render({ field: { onChange, value }, fieldState: { error } }) {
            //         return <Select
            //             required
            //             error={error}
            //             label={getIntlText('setting.integration.label.credentials')}
            //             options={credentialsOption}
            //             formControlProps={{
            //                 sx: { my: 1.5 },
            //             }}
            //             value={value}
            //             onChange={onChange}
            //         />
            //     }
            // },
        );

        return result;
    }, [getIntlText]);

    return formItems;
};

export default useFormItems;
