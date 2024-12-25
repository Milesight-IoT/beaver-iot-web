import { useRef, useMemo, forwardRef } from 'react';
import { isEqual } from 'lodash-es';

import { Form, ButtonText, Button, useForm } from '@ms-mobile-ui/themed';

import { parseStyleString } from './util';
import * as Milesight from '../components/index';

export interface IPlugin {
    /**
     * 自定义组件配置
     */
    config: any;
    /**
     * 表单数据提交
     */
    onOk: (data: any) => void;
    /**
     * 表单数据变更回调
     */
    onChange?: (data: any, field: string) => void;
    /**
     * 传入的表单值
     */
    value?: any;
}

const CreatePlugin = forwardRef((props: IPlugin, ref: any) => {
    const { config, onOk, onChange, value: defaultValue } = props;
    const currentTheme = 'default';
    const defaultRef = useRef<Record<string, any>>({});
    const [form] = useForm<any>();

    const getFormItems = useMemo(() => {
        const formItems: any[] = [];
        const defaultValues: Record<string, any> = {};
        config.configProps?.forEach((item: any) => {
            const { style: configStyle, components } = item;
            const themeStyle = item?.theme?.[currentTheme]?.style
                ? parseStyleString(item?.theme?.[currentTheme]?.style)
                : undefined;
            const className = item?.theme?.[currentTheme]?.class
                ? item?.theme?.[currentTheme]?.class
                : undefined;
            components?.forEach((component: any) => {
                const AllComponent: any = { ...Milesight };
                if (AllComponent[component.type]) {
                    const Component = AllComponent[component.type];
                    const commonStyle = component?.style
                        ? parseStyleString(component?.style)
                        : undefined;
                    const { type, style, valueType, componentProps, ...restItem } = component;
                    const rules: any = { ...(component.rules || {}) };
                    formItems.push({
                        ...restItem,
                        name: component.key,
                        rules: rules,
                        style: configStyle ? parseStyleString(configStyle) : {},
                        render: (data: any) => {
                            let value = defaultValue?.[component.key];
                            if (value === undefined && component.defaultValue !== undefined) {
                                value = component.defaultValue;
                            }
                            if (!defaultValues[component.key] && value !== undefined) {
                                defaultValues[component.key] = value;
                            }

                            return (
                                <Form.Item
                                    key={component.key}
                                    name={component.key}
                                    label={component.title}
                                    rules={rules}
                                    style={{ ...commonStyle, ...themeStyle }}
                                >
                                    <Component
                                        {...componentProps}
                                        value={value}
                                        onChange={(e: any) => {
                                            const newValue = e?.target ? e.target.value : e;
                                            defaultValues[component.key] = newValue;
                                            if (onChange) {
                                                onChange({ ...defaultValues }, component.key);
                                            }
                                        }}
                                        style={style ? parseStyleString(style) : {}}
                                        className={`${className} ${components?.length === 1 ? 'form-item' : ''}`}
                                    />
                                </Form.Item>
                            );
                        },
                    });
                }
            });
        });
        return { formItems, defaultValues };
    }, [config, defaultValue, currentTheme, onChange]);

    const handleSubmit = async () => {
        try {
            const formValues = await form.validateFields();
            onOk(formValues); // 确保调用 onOk 函数
        } catch (error) {
            console.error('Validation Failed:', error);
        }
    };

    const defaultIsChange = isEqual(defaultRef.current, getFormItems.defaultValues);

    const defaultValues = useMemo(() => {
        return getFormItems.defaultValues;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getFormItems.defaultValues, defaultIsChange]);

    const formItems = useMemo(() => {
        return getFormItems.formItems;
    }, [getFormItems.formItems]);

    return (
        <Form
            ref={ref}
            form={form}
            initialValues={defaultValues}
            onFinish={handleSubmit}
        >
            {formItems.map((item, index) => (
                <Form.Item key={index} {...item} />
            ))}
            <Form.Item>
                <Button h='$10' w={'100%'} onPress={() => form.submit()}>
                    <ButtonText color="$white">Save</ButtonText>
                </Button>
            </Form.Item>
        </Form>
    );
});

export default CreatePlugin;
