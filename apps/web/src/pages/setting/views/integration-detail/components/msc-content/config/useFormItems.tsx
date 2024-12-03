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
import { checkRequired } from '@milesight/shared/src/utils/validators';
import { useI18n } from '@milesight/shared/src/hooks';
import { VisibilityIcon, VisibilityOffIcon } from '@milesight/shared/src/components';

export enum OPENAPI_KEYS {
    /** OpenAPI Status 实体关键字 */
    STATUS = 'openapi_status',
    /** OpenAPI Server Url 实体关键字 */
    SERVER_URL = 'openapi.server_url',
    /** OpenAPI ClientID 实体关键字 */
    CLIENT_ID = 'openapi.client_id',
    /** OpenAPI ClientSecret 实体关键字 */
    CLIENT_SECRET = 'openapi.client_secret',
}

export type FormDataProps = Omit<Record<OPENAPI_KEYS, string | boolean>, OPENAPI_KEYS.STATUS> & {
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
            {
                name: OPENAPI_KEYS.SERVER_URL,
                rules: {
                    validate: { checkRequired: checkRequired() },
                },
                defaultValue: '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        // TODO: 确认使用 Input / Select 组件
                        // <FormControl fullWidth size="small" sx={{ my: 1.5 }}>
                        //     <InputLabel id="select-label-address">
                        //         {getIntlText('setting.integration.param_server_address')}
                        //     </InputLabel>
                        //     <Select
                        //         label={getIntlText('setting.integration.param_server_address')}
                        //         labelId="select-label-address"
                        //         error={!!error}
                        //         value={value}
                        //         onChange={onChange}
                        //     >
                        //         <MenuItem value="1">1</MenuItem>
                        //         <MenuItem value="2">2</MenuItem>
                        //         <MenuItem value="3">3</MenuItem>
                        //     </Select>
                        //     {!!error && <FormHelperText error>{error.message}</FormHelperText>}
                        // </FormControl>
                        <TextField
                            {...commTextProps}
                            label={getIntlText('setting.integration.param_server_address')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
            {
                name: OPENAPI_KEYS.CLIENT_ID,
                rules: {
                    validate: { checkRequired: checkRequired() },
                },
                defaultValue: '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            {...commTextProps}
                            label={getIntlText('setting.integration.param_client_id')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
            {
                name: OPENAPI_KEYS.CLIENT_SECRET,
                rules: {
                    validate: { checkRequired: checkRequired() },
                },
                defaultValue: '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            {...commTextProps}
                            autoComplete="new-password"
                            label={getIntlText('setting.integration.param_client_secret')}
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
        ];

        return items;
    }, [showSecret, getIntlText, handleClickShowSecret]);

    return formItems;
};

export default useFormItems;
