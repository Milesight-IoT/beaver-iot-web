export type rulesPatternType = {
    value: any;
    message: string;
};

export type rulesType = {
    required?: boolean | string;
    pattern?: rulesPatternType;
    minLength?: rulesPatternType;
    maxLength?: rulesPatternType;
    min?: rulesPatternType;
    max?: rulesPatternType;
};

export type fieldType = {
    onChange: any;
    value: fieldStateProps;
};

export type fieldStateType = {
    error: any;
};

export interface renderType {
    field: fieldType;
    fieldState: fieldStateType;
    formState: any;
}

export interface FormItemsProps {
    name: Path<T>;
    render: any;
    customRender?: () => React.ReactNode; // 自定义渲染其他其他内容
    multiple?: number;
    multipleIndex?: number;
    rules?: rulesType;
    style?: string;
    title?: string;
    label?: string;
    defaultValue?: any;
    children?: FormItemsProps[]; // 一行多个子表单
    col?: number; // 布局列数
}

export type UseFormItemsType = Omit<FormItemsProps, 'render'>;

export interface UseFormItemsProps extends UseFormItemsType {
    type?: string;
    props?: any;
    render?: (data: any) => any;
}
