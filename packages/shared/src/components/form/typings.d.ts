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
    multiple?: number;
    multipleIndex?: number;
    rules?: rulesType;
    style?: string;
    title?: string;
}

export type UseFormItemsType = Omit<FormItemsProps, 'render'>;

export interface UseFormItemsProps extends UseFormItemsType {
    type?: string;
    props?: any;
    label?: string;
    render?: (data: renderType) => void;
}
