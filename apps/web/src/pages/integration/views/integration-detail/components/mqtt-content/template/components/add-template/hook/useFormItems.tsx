import { useMemo } from 'react';
import { type ControllerProps } from 'react-hook-form';
import {
    IconButton,
    TextField,
    TextFieldProps,
    InputAdornment,
    Tooltip,
    Link,
} from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { checkMaxLength, checkRequired } from '@milesight/shared/src/utils/validators';
import { OpenInNewIcon } from '@milesight/shared/src/components';
import CodeEditor from '../../code-editor';

export interface FormDataProps {
    name: string;
    topic: string;
    description: string;
    yaml: string;
}

const useFormItems = ({ prefixTopic }: { prefixTopic: string }) => {
    const { lang, getIntlText } = useI18n();

    const yamlGuideLink = useMemo(() => {
        if (lang === 'CN') {
            return 'https://www.milesight.com/beaver-iot/zh-Hans/docs/dev-guides/backend/advanced/entity-definition/#%E5%9F%BA%E4%BA%8Eyaml%E6%9E%84%E5%BB%BA';
        }
        return 'https://www.milesight.com/beaver-iot/docs/dev-guides/backend/advanced/entity-definition/#yaml-based-construction';
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
                            if (!/^[a-zA-Z0-9_@#$\\/[\]-]+$/.test(value.toString())) {
                                return getIntlText('common.valid.input_letter_num_special_char', {
                                    1: '_@#$-/[]',
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
                                },
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
                            value={value}
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
    }, [getIntlText, prefixTopic]);

    return formItems;
};

export default useFormItems;
