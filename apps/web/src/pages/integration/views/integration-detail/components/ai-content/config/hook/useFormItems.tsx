import { useMemo } from 'react';
import { type ControllerProps } from 'react-hook-form';
import { TextField, InputAdornment, type TextFieldProps, Box } from '@mui/material';
import {
    checkRequired,
    checkMaxLength,
    checkStartWithHttpOrHttps,
} from '@milesight/shared/src/utils/validators';
import { useI18n, useTheme } from '@milesight/shared/src/hooks';
import { PasswordInput } from '@/components';

export enum AI_KEYS {
    /** ai server connect status */
    STATUS = 'api_status',
    /** ai server url */
    SERVER_URL = 'ai_inference_properties.base_url',
    /** ai server token */
    SECRET = 'ai_inference_properties.token',
}

/**
 * ai connect state
 */
type AiStatusType = 'true' | 'false';

type AiStatusItemType = {
    /** label */
    label: string;
    /** color */
    color: string;
};

export type FormDataProps = Record<AI_KEYS, string | boolean> & {
    [key: string]: any;
};

const useFormItems = () => {
    const { getIntlText } = useI18n();
    const { green, grey } = useTheme();

    const aiStatusMap = useMemo<Record<AiStatusType, AiStatusItemType>>(
        () => ({
            true: {
                label: getIntlText('common.label.connected'),
                color: green[600],
            },
            false: {
                label: getIntlText('common.label.not_connected'),
                color: grey[600],
            },
        }),
        [green, grey, getIntlText],
    );

    const formItems = useMemo(() => {
        const commTextProps: Partial<TextFieldProps> = {
            required: true,
            fullWidth: true,
        };

        const items: ControllerProps<FormDataProps>[] = [
            {
                name: AI_KEYS.STATUS,
                render({ field: { onChange, value }, fieldState: { error } }) {
                    const status = aiStatusMap[String(value) as AiStatusType] || aiStatusMap.false;
                    return (
                        <TextField
                            {...commTextProps}
                            disabled
                            label={getIntlText('common.label.connect_status')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            required={false}
                            value=""
                            onChange={onChange}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    bgcolor: status?.color,
                                                }}
                                            />
                                            <Box
                                                sx={{
                                                    marginLeft: 1,
                                                    color: status?.color,
                                                    fontSize: 14,
                                                }}
                                            >
                                                {status.label}
                                            </Box>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    );
                },
            },
            {
                name: AI_KEYS.SERVER_URL,
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        checkStartWithHttpOrHttps: checkStartWithHttpOrHttps(),
                        checkMaxLength: checkMaxLength({ max: 256 }),
                    },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <TextField
                            {...commTextProps}
                            autoComplete="new-password"
                            disabled={disabled}
                            label={getIntlText('setting.integration.ai_server_url')}
                            placeholder={getIntlText('common.placeholder.input')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value || ''}
                            onChange={onChange}
                        />
                    );
                },
            },
            {
                name: AI_KEYS.SECRET,
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        checkMaxLength: checkMaxLength({ max: 100 }),
                    },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <PasswordInput
                            {...commTextProps}
                            disabled={disabled}
                            autoComplete="new-password"
                            label={getIntlText('setting.integration.token')}
                            placeholder={getIntlText('common.placeholder.input')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value || ''}
                            onChange={onChange}
                        />
                    );
                },
            },
        ];

        return items;
    }, [getIntlText]);

    return formItems;
};

export default useFormItems;
