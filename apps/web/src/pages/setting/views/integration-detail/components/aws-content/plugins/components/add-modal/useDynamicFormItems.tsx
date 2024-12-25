import { useMemo } from 'react';
import { useForm, Controller, type ControllerProps } from 'react-hook-form';
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
 * 表单数据类型
 */
export type FormDataProps = Record<string, any>;

/**
 * 添加插件动态表单项
 */
const useDynamicFormItems = ({ entities }: Props) => {
    const { getIntlText } = useI18n();
    const { decodeFormParams } = useEntityFormItems({
        entities,
        isAllRequired: true,
    });

    const { control, setValue } = useForm<FormDataProps>();

    const formItems = useMemo(() => {
        const result: ControllerProps<FormDataProps>[] = [];

        // 文件名字段
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
                        label={getIntlText('common.label.fileName')}
                        value={value}
                        onChange={onChange}
                        error={!!error}
                        helperText={error ? error.message : null}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                );
            },
        });

        // 文件内容字段
        result.push({
            name: 'text',
            rules: {
                validate: { checkRequired: checkRequired() },
            },
            defaultValue: '',
            render({ field: { onChange, value }, fieldState: { error } }) {
                const handleFileChange = async (event) => {
                    const file = event.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            try {
                                const fileContent = e.target.result;
                                const base64Content = fileContent.split(',')[1]; // 获取 Base64 部分
                                onChange(base64Content);
                                setValue('name', file.name); // 实时更新文件名
                            } catch (error) {
                                console.error('Error reading file:', error);
                            }
                        };
                        reader.readAsDataURL(file);
                    }
                };

                return (
                    <TextField
                        required
                        fullWidth
                        type="file"
                        label={getIntlText('common.label.file')}
                        error={!!error}
                        helperText={error ? error.message : null}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        onChange={handleFileChange}
                    />
                );
            },
        });

        return result;
    }, [getIntlText, setValue]);

    return { formItems, decodeFormParams, control };
};

export default useDynamicFormItems;
