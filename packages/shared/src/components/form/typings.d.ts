import { type UseFormSetValue, type UseFormHandleSubmit, type UseFormReset } from 'react-hook-form';

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
    customRender?: () => React.ReactNode; // Customize rendered other content
    multiple?: number;
    multipleIndex?: number;
    rules?: rulesType;
    style?: string;
    title?: string;
    label?: string;
    defaultValue?: any;
    children?: FormItemsProps[]; // One line of multiple sub lines
    col?: number; // Number of layouts
}

export interface FormInstance<T extends FieldValues> {
    reset: UseFormReset<T>;
    setValue: UseFormSetValue<T>;
    handleSubmit: ReturnType<UseFormHandleSubmit<T>>;
}

export type UseFormItemsType = Omit<FormItemsProps, 'render'>;

export interface UseFormItemsProps extends UseFormItemsType {
    type?: string;
    props?: any;
    render?: (data: any) => any;
}
