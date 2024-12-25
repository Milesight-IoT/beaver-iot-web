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
 * 表单数据类型
 */
export type FormDataProps = Record<string, any>;

/**
 * 添加设备动态表单项
 */
const useDynamicFormItems = ({ entities }: Props) => {
    const { getIntlText } = useI18n();
    const { decodeFormParams } = useEntityFormItems({
        entities,
        isAllRequired: true,
    });

    const formItems = useMemo(() => {
        const result: ControllerProps<FormDataProps>[] = [];

        // // 名称字段
        // result.push({
        //     name: 'name',
        //     rules: {
        //         validate: { checkRequired: checkRequired() },
        //     },
        //     defaultValue: '',
        //     render({ field: { onChange, value }, fieldState: { error } }) {
        //         return (
        //             <TextField
        //                 required
        //                 fullWidth
        //                 type="text"
        //                 label={getIntlText('common.label.name')}
        //                 error={!!error}
        //                 helperText={error ? error.message : null}
        //                 value={value}
        //                 onChange={onChange}
        //             />
        //         );
        //     },
        // });

        // // 文件上传字段
        // result.push({
        //     name: 'name',
        //     rules: {
        //         validate: { checkRequired: checkRequired() },
        //     },
        //     defaultValue: null,
        //     render({ field: { onChange, value }, fieldState: { error } }) {
        //         return (
        //             <TextField
        //                 required
        //                 fullWidth
        //                 type="file"
        //                 label={getIntlText('common.label.file')}
        //                 error={!!error}
        //                 helperText={error ? error.message : null}
        //                 InputLabelProps={{
        //                     shrink: true,
        //                 }}
        //                 onChange={(e) => onChange(e.target.files[0])}
        //             />
        //         );
        //     },
        // });
        // 文件上传字段
        result.push({
            name: 'name',
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
                                // // 将文件内容转换为 JSON 字符串
                                // const jsonContent = JSON.stringify({ text: fileContent });
                                // 将文件内容转换为 JSON 字符串
                                const jsonContent = JSON.stringify(fileContent);
                                onChange(jsonContent);
                            } catch (error) {
                                console.error('Error reading file:', error);
                            }
                        };
                        reader.readAsText(file);
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
    }, [getIntlText]);

    return { formItems, decodeFormParams };
};


export default useDynamicFormItems;
