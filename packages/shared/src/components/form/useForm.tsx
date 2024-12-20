import { useMemo } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import * as Mui from '../mui-form';
import Select from '../select';
import Switch from '../switch';
import useI18n from '../../hooks/useI18n';
import { UseFormItemsProps, FormItemsProps } from './typings';

interface useFormProps {
    formItems: UseFormItemsProps[];
}

const useForm = (props: useFormProps) => {
    const { getIntlText } = useI18n();
    const { formItems } = props;

    const getResultItem = (item: UseFormItemsProps, index: number) => {
        const { type, render, label, props, rules, ...formItem } = item;
        const Component = type ? { ...(Mui as any), DatePicker, Select, Switch }[type] : null;
        if (rules?.required && rules.required === true) {
            rules.required = getIntlText('valid.input.required');
        }
        if (
            (rules?.maxLength?.value || rules?.maxLength?.value === 0) &&
            !rules?.maxLength?.message
        ) {
            rules.maxLength.message = getIntlText('valid.input.max_length', {
                1: rules?.maxLength?.value,
            });
        }
        if ((rules?.max?.value || rules?.max?.value === 0) && !rules?.max?.message) {
            rules.max.message = getIntlText('valid.input.max_value', {
                0: rules?.max?.value,
            });
        }
        if (
            (rules?.minLength?.value || rules?.minLength?.value === 0) &&
            !rules?.minLength?.message
        ) {
            rules.minLength.message = getIntlText('valid.input.max_length', {
                0: rules?.minLength?.value,
            });
        }
        if ((rules?.min?.value || rules?.min?.value === 0) && !rules?.min?.message) {
            rules.min.message = getIntlText('valid.input.max_value', {
                0: rules?.min?.value,
            });
        }
        const children: FormItemsProps[] = [];
        if (item.children) {
            item.children.forEach((child, i) => {
                children.push(getResultItem(child, i));
            });
        }
        return {
            ...formItem,
            rules,
            children,
            label,
            render:
                render ||
                ((data: any) => {
                    const value = data?.field?.value;
                    const onChange = data?.field?.onChange;
                    const error = data?.fieldState?.error;
                    return (
                        <Component
                            {...formItem}
                            {...props}
                            required={!!rules?.required}
                            label={label}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                            className={index === forms.length - 1 ? '' : 'form-item'}
                            fullWidth
                        />
                    );
                }),
        };
    };

    const forms: FormItemsProps[] = useMemo(() => {
        return formItems?.map((items: UseFormItemsProps, index: number) => {
            return getResultItem(items, index);
        });
    }, [formItems]);

    return forms;
};

export default useForm;
