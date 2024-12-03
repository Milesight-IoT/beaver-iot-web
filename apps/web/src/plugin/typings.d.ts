/**
 * 主题
 */
declare type ThemeType = 'default' | 'dark';

/**
 * 主题样式设置
 */
declare interface ThemeProps {
    /**
     * 样式类名设置
     */
    class?: string;
    /**
     * 直连样式设置
     */
    style?: string;
}

declare interface OptionsProps<T extends string | number = string | number> {
    label: string;
    value?: T;
    options?: OptionsProps<T>[];
}

declare interface ComponentProps {
    /**
     * 表单组件类型
     * @description 映射到components文件中组件，也可以直接是组件库支持的组件
     */
    type: string;
    /**
     * 组件绑定字段
     */
    key: string;
    /**
     * 表单组件标题
     */
    title?: string;
    /**
     * 值类型，没有填默认 'string'
     * 可选类型为：'string' | 'number' | 'boolean' | 'array' | 'object'
     */
    valueType?: string;
    /**
     * 默认值
     */
    defaultValue?: string | number | boolean | Array<string | number>;
    /**
     * 组件样式
     */
    style?: string;
    /**
     * 依赖其他组件值的样式
     * @description 键值为style普通的值，值为依赖组件的key
     */
    styleDepended?: record<string, string>;
    /**
     * 组件内置属性
     * @description 可配置组件的内置属性，参考MUI官网文档
     */
    componentProps?: Record<string, any>;
    /**
     * 从远程服务获取数据
     * @description 未配置时取options配置
     */
    getDataUrl?: string;
    /**
     * 下拉选项配置
     * @description 无getDataUrl时生效
     */
    options?: OptionsProps[];
    /**
     * 校验规则
     * @description 支持配置多个规则，参考react-hooks-form校验规则
     */
    rules?: rulesType;
}

declare interface ConfigProps {
    /**
     * 表单组件标题
     * @description 一个配置项显示的标题
     */
    title?: string;
    /**
     * 组件样式
     */
    style?: string;
    /**
     * 组件类名
     */
    class?: string;
    /**
     * 组件样式
     * @description 支持填写多种风格，默认取default
     */
    theme?: Record<ThemeType, ThemeProps>;
    /**
     * 组件集合
     * @description 组件集合，用于配置表单组件，一个配置项集合，可由多个基础组件组合
     */
    components?: ComponentProps[];
}

declare interface ViewThemeProps {
    /**
     * 样式类名
     */
    class?: string;
    /**
     * 直连样式
     */
    style?: string;
}

declare interface ViewProps {
    /**
     * html标签名称
     * @description 具体标签参考html支持的标签
     */
    tag: string;
    /**
     * html标签属性
     * @description 具体标签属性参考html标签支持的属性
     */
    props?: Record<string, any>;
    /**
     * html标签id
     */
    id?: string;
    /**
     * html标签内容
     * @description 固定的标签内容，params属性无值时生效
     */
    content?: string;
    /**
     * html内容绑定的参数变量
     * @description 支持绑定多个参数，绑定后默认显示绑定的变量值，多个直接拼接
     */
    params?: string[];
    /**
     * html标签显示依赖
     */
    showDepended?: Record<string, any>;
    /**
     * html子节点
     */
    children?: ViewProps[];
    /**
     *  通用类名
     */
    class?: string;
    /**
     *  通用样式
     */
    style?: string;
    /**
     * 依赖其他组件值的样式
     * @description 键值为style普通的值，值为依赖组件的key
     */
    styleDepended?: record<string, string>;
    /**
     * html标签风格
     * @description 支持配置多个风格
     */
    themes?: Record<ThemeType, ViewThemeProps>;
}

declare interface CustomComponentProps {
    /**
     * 组件名称
     * @description name是组件显示的名称，比如在选择使用哪个组件的时候作为显示使用
     */
    name: string;
    /**
     * 组件类型
     * @description 用来区分被使用者使用组件的唯一标识，与plugins下文件夹名称一致
     */
    type: string;
    /**
     * 组件配置属性，可配置多个
     */
    configProps: ConfigProps[];
    /**
     * 预览界面配置
     * @description 可以是json单独配置各个属性，也可以直接传入html字符串，其中${{}}包围的是参数变量，渲染的时候替换
     */
    view: ViewProps[] | string;
    /**
     * 组件分类
     * @description 用来区分组件的类别，比如图表、数据显示等，目前有data_chart/operate/data_card三种，未填则默认为其他类型
     */
    class?: string;
    /**
     * 当前组件已配置值
     * @description 无需配置，在配置界面会默认传
     */
    config?: Record<string, any>;
    /**
     * 组件唯一标识
     * @description 存储到服务端后数据库自动生成，无需维护
     */
    id?: string;
    /**
     * 是否预览模式
     * @description 默认非预览，不需要手动配置该项，在配置界面会默认传true
     */
    isPreview?: boolean;
    /**
     * 设置组件显示默认占容器几列，最小值为1，最大为12
     * @description 每行为容器高度是1/12
     */
    defaultCol: number;
    /**
     * 设置组件显示默认占容器几行，最小值为1，最大为24
     * @description 每行为容器高度是1/24
     */
    defaultRow: number;
    /**
     * 设置组件显示最小占容器几列，最小值为1，最大为12
     * @description 每行为容器高度是1/12
     */
    minCol: number;
    /**
     * 设置组件显示最小占容器几行，最小值为1，最大为24
     * @description 每行为容器高度是1/24
     */
    maxRow: number;
}

/**
 * 实体下拉框类型
 */
declare interface EntityOptionType {
    label: string;
    value: string | number;
    valueType: string;
    description: string;
    /** 源数据 */
    rawData?: ObjectToCamelCase<Omit<EntityData, 'entity_value_attribute'>> & {
        entityValueAttribute: EntityValueAttributeType;
    };
}

/**
 * 实体下拉选项组件通用 props
 */
declare interface EntitySelectCommonProps<T = EntityOptionType> {
    /**
     * 实体类型
     */
    entityType?: EntityType;
    /**
     * 实体数据值类型
     */
    entityValueTypes?: EntityValueDataType[];
    /**
     * 实体属性访问类型
     */
    entityAccessMods?: EntityAccessMode[];
    /**
     * 实体是否排除子节点
     */
    entityExcludeChildren?: boolean;
    /**
     * 自定义实体过滤条件
     */
    customFilterEntity?: string;
    /**
     * 最大选中数量
     * 仅多选（multiple）时有效
     */
    maxCount?: number;
    onChange: (value: T | null) => void;
}

declare module 'chartjs-plugin-zoom' {
    const ChartZoom: any;
    export default ChartZoom;
}
