import { useState, useMemo, useCallback } from 'react';
import { type ControllerProps } from 'react-hook-form';
import {
    TextField,
    IconButton,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    type TextFieldProps,
} from '@mui/material';
import { checkRequired, checkUrl } from '@milesight/shared/src/utils/validators';
import { useI18n } from '@milesight/shared/src/hooks';
import { VisibilityIcon, VisibilityOffIcon } from '@milesight/shared/src/components';

export enum AWS_KEYS {
    /** OpenAPI Status 实体关键字 */
    STATUS = 'openapi_status',
    /** OpenAPI Server Url 实体关键字 */
    SERVER_URL = 'openapi.server_url',
    /** OpenAPI ClientID 实体关键字 */
    ACCESS_KEY = 'openapi.access_key',
    /** OpenAPI ClientSecret 实体关键字 */
    SECRET_KEY = 'openapi.secret_key',
    WEBHOOK_URL = 'openapi.webhook_url',
    ALARM_URL = 'openapi.alarm_url',
}

export type FormDataProps = Omit<Record<AWS_KEYS, string | boolean>, AWS_KEYS.STATUS> & {
    [key: string]: any;
};

const useFormItems = () => {
    const { getIntlText } = useI18n();
    const [showSecret, setShowSecret] = useState(false);
    const handleClickShowSecret = useCallback(() => setShowSecret(show => !show), []);

    const formItems = useMemo(() => {
        const commTextProps: Partial<TextFieldProps> = {
            required: true,
            fullWidth: true,
            type: 'text',
        };

        const items: ControllerProps<FormDataProps>[] = [
            // {
            //     name: AWS_KEYS.SERVER_URL,
            //     rules: {
            //         validate: { checkRequired: checkRequired() },
            //     },
            //     defaultValue: '',
            //     render({ field: { onChange, value }, fieldState: { error } }) {
            //         return (
            //             // TODO: 确认使用 Input / Select 组件
            //             // <FormControl fullWidth size="small" sx={{ my: 1.5 }}>
            //             //     <InputLabel id="select-label-address">
            //             //         {getIntlText('setting.integration.param_server_address')}
            //             //     </InputLabel>
            //             //     <Select
            //             //         label={getIntlText('setting.integration.param_server_address')}
            //             //         labelId="select-label-address"
            //             //         error={!!error}
            //             //         value={value}
            //             //         onChange={onChange}
            //             //     >
            //             //         <MenuItem value="1">1</MenuItem>
            //             //         <MenuItem value="2">2</MenuItem>
            //             //         <MenuItem value="3">3</MenuItem>
            //             //     </Select>
            //             //     {!!error && <FormHelperText error>{error.message}</FormHelperText>}
            //             // </FormControl>
            //             <TextField
            //                 {...commTextProps}
            //                 label={getIntlText('setting.integration.param_server_address')}
            //                 error={!!error}
            //                 helperText={error ? error.message : null}
            //                 value={value}
            //                 onChange={onChange}
            //             />
            //         );
            //     },
            // },
            {
                name: AWS_KEYS.ACCESS_KEY,
                rules: {
                    validate: { checkRequired: checkRequired() },
                },
                defaultValue: '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            {...commTextProps}
                            label={getIntlText('setting.integration.param_access_key')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
            {
                name: AWS_KEYS.SECRET_KEY,
                rules: {
                    validate: { checkRequired: checkRequired() },
                },
                defaultValue: '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            {...commTextProps}
                            autoComplete="new-password"
                            label={getIntlText('setting.integration.param_secret_key')}
                            type={showSecret ? 'text' : 'password'}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowSecret}
                                                onMouseDown={e => e.preventDefault()}
                                                onMouseUp={e => e.preventDefault()}
                                                edge="end"
                                            >
                                                {showSecret ? (
                                                    <VisibilityOffIcon />
                                                ) : (
                                                    <VisibilityIcon />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    );
                },
            },
            {
                name: AWS_KEYS.ALARM_URL,
                rules: {
                    validate: { checkUrl: checkUrl() },
                },
                defaultValue: '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            {...commTextProps}
                            label={getIntlText('Alarm Url')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
            {
                name: AWS_KEYS.WEBHOOK_URL,
                rules: {
                    validate: { checkUrl: checkUrl() },
                },
                defaultValue: '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            {...commTextProps}
                            label={getIntlText('Webhool Url')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            }
                

        ];

        return items;
    }, [showSecret, getIntlText, handleClickShowSecret]);

    return formItems;
};

export default useFormItems;
