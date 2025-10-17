import { useMemo } from 'react';
import { type ControllerProps } from 'react-hook-form';
import {
    IconButton,
    TextField,
    TextFieldProps,
    InputAdornment,
    Tooltip,
    Link,
    Typography,
} from '@mui/material';
import { useCopy, useI18n } from '@milesight/shared/src/hooks';
import {
    checkMaxLength,
    checkRequired,
    checkRangeValue,
    checkPositiveInt,
    checkStartWithSpecialChar,
} from '@milesight/shared/src/utils/validators';
import { ContentCopyIcon, OpenInNewIcon } from '@milesight/shared/src/components';
import CodeEditor from '../../code-editor';

export interface FormDataProps {
    name: string;
    topic: string;
    description: string;
    yaml: string;
    timeout: number;
}

const useFormItems = ({ prefixTopic }: { prefixTopic: string }) => {
    const { lang, getIntlText } = useI18n();
    const { handleCopy } = useCopy();

    const yamlGuideLink = useMemo(() => {
        if (lang === 'CN') {
            return 'https://www.milesight.com/beaver-iot/zh-Hans/docs/user-guides/published-integrations/mqtt-devices-integrated';
        }
        return 'https://www.milesight.com/beaver-iot/docs/user-guides/published-integrations/mqtt-devices-integrated';
    }, [lang]);

    const handleClickLink = () => {
        window.open(yamlGuideLink);
    };

    const formItems = useMemo(() => {
        const commTextProps: Partial<TextFieldProps> = {
            fullWidth: true,
            required: true,
        };
        const result: ControllerProps<FormDataProps>[] = [
            {
                name: 'name',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        checkMaxLength: checkMaxLength({ max: 64 }),
                        checkValidChar: value => {
                            if (!/^[a-zA-Z0-9:_@#$/[\]-]+$/.test(value.toString())) {
                                return getIntlText('common.valid.input_letter_num_special_char', {
                                    1: '_@#$-/[]:',
                                });
                            }
                            return true;
                        },
                    },
                },
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            {...commTextProps}
                            label={getIntlText('setting.integration.device_template_name')}
                            placeholder={getIntlText('common.placeholder.input')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                            onBlur={event => {
                                onChange(event?.target?.value?.trim());
                            }}
                        />
                    );
                },
            },
            {
                name: 'topic',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        checkMaxLength: checkMaxLength({ max: 100 }),
                        checkValidChar: value => {
                            if (!/^[A-Za-z0-9${}_/@-]+$/.test(value.toString())) {
                                return getIntlText('common.valid.input_letter_num_special_char', {
                                    1: '${}-_/@',
                                });
                            }
                            return true;
                        },
                        checkStartWithSpecialChar: checkStartWithSpecialChar({ char: '/' }),
                    },
                },
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            {...commTextProps}
                            label={getIntlText('setting.integration.device_topic')}
                            placeholder={getIntlText('common.placeholder.input')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ mr: 0.6 }}>
                                            <Tooltip title={prefixTopic}>
                                                <span>{prefixTopic}</span>
                                            </Tooltip>
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="copy text"
                                                onClick={e => {
                                                    handleCopy(
                                                        prefixTopic + (value ? String(value) : ''),
                                                        e.currentTarget?.closest('div'),
                                                    );
                                                }}
                                                onMouseDown={(e: any) => e.preventDefault()}
                                                onMouseUp={(e: any) => e.preventDefault()}
                                                edge="end"
                                            >
                                                <ContentCopyIcon />
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
                name: 'timeout',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        checkPositiveInt: checkPositiveInt(),
                        checkRangeValue: checkRangeValue({ min: 1, max: 2880 }),
                    },
                },
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            {...commTextProps}
                            label={getIntlText('setting.integration.label_device_offline_timeout')}
                            placeholder={getIntlText('common.placeholder.input')}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Typography sx={{ fontSize: 14 }}>
                                                {getIntlText('common.unit.minute_short')}
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                            onBlur={event => {
                                onChange(event?.target?.value?.trim());
                            }}
                        />
                    );
                },
            },
            {
                name: 'yaml',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                    },
                },
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <CodeEditor
                            title={getIntlText('setting.integration.device_entity_design')}
                            value={value as string}
                            error={error}
                            onChange={onChange}
                            rightSlot={
                                <Link
                                    underline="hover"
                                    component="button"
                                    onClick={handleClickLink}
                                    sx={{
                                        fontSize: 14,
                                    }}
                                >
                                    {getIntlText('setting.integration.view_doc')}
                                    <IconButton>
                                        <OpenInNewIcon
                                            color="primary"
                                            sx={{ width: 16, height: 16 }}
                                        />
                                    </IconButton>
                                </Link>
                            }
                        />
                    );
                },
            },
            {
                name: 'description',
                rules: {
                    validate: {
                        checkMaxLength: checkMaxLength({ max: 200 }),
                    },
                },
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            {...commTextProps}
                            required={false}
                            multiline
                            rows={3}
                            maxRows={3}
                            label={getIntlText('common.label.remark')}
                            placeholder={getIntlText('common.placeholder.input')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                            sx={{
                                '& .MuiInputBase-multiline': {
                                    pt: 1,
                                    pb: 1,
                                },
                                '& textarea': {
                                    pt: 0.5,
                                    pb: 0.5,
                                },
                            }}
                        />
                    );
                },
            },
        ];
        return result;
    }, [getIntlText, prefixTopic, handleCopy]);

    return formItems;
};

export default useFormItems;
