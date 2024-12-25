import type { ConfigureType, ViewConfigProps } from '../../typings';

export const useDynamic = () => {
    /**
     * 动态生成的每一项表单
     */
    const generateFormItem = (title: string, id: ApiKey, value: Record<string, any>) => {
        return {
            $$type: 'dynamic',
            title,
            style: 'margin-bottom: 20px;',
            key: 'idd',
            components: [
                {
                    type: 'addressSelect',
                    title: 'Address',
                    key: `addr_${id}`,
                    style: 'width: 100%',
                    defaultValue: value[`addr_${id}`] || undefined,
                    componentProps: {
                        size: 'small',
                    },
                },
                {
                    type: 'multiEntitySelectByDevice',
                    title: 'Entity-Device',
                    key: `deviceEntity_${id}`,
                    style: 'width: 100%',
                    valueType: 'array',
                    defaultValue: value[`deviceEntity_${id}`] || undefined,
                    componentProps: {
                        size: 'small',
                        entityType: ['PROPERTY'],
                        deviceId: id,
                    },
                },
            ],
        };
    };
    /**
     * 生成动态configure逻辑
     */
    const dynamicConfigure = (device: DeviceOptionType[], value: Record<string, any>) => {
        // const { value: id } = deviceItem || {};
        // const { enum: enumStruct } = entityValueAttribute || {};

        // 非枚举类型
        // if (!enumStruct) return [generateFormItem(`Appearance`, entityId?.toString(), value)];

        // 枚举类型
        return (device || []).map((item: DeviceOptionType) => {
            return generateFormItem(`Appearance of ${item.label}`, item.value, value);
        });
    };

    /** 动态渲染表单 */
    const updateDynamicForm = (value: ViewConfigProps, config: ConfigureType) => {
        const { device } = value || [];
        // 获取当前选中实体
        // const { rawData: currentEntity } = entity || {};
        // if (!currentEntity) return config;

        // 渲染动态表单
        const result = dynamicConfigure(device, value);
        if (!result) return config;

        // 动态渲染表单
        const { configProps } = config || {};
        const newConfigProps = [
            ...configProps.filter((item: any) => item.$$type !== 'dynamic'),
            ...result,
        ];
        config.configProps = newConfigProps;
        return config;
    };

    return {
        updateDynamicForm,
    };
};
