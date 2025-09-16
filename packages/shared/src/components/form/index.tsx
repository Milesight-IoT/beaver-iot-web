import React, { useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { useForm, Controller, FieldValues, type SubmitHandler } from 'react-hook-form';
import { Grid, Box, Tooltip } from '@mui/material';
import { isEqual } from 'lodash-es';
import useFormItems from './useForm';
import { UseFormItemsProps, FormItemsProps, FormInstance } from './typings';
import './style.less';

interface formProps<T extends FieldValues> {
    formItems: UseFormItemsProps[];
    onOk: (data: T) => void;
    onChange?: (data: T) => void;
    defaultValues?: any;
}

/**
 * @deprecated Please use `react-hook-form` library directly for clearer and
 * more flexible control
 */
const Forms = <T extends FieldValues>(
    props: formProps<T>,
    ref: React.ForwardedRef<FormInstance<T>>,
) => {
    const { formItems, onOk, onChange, defaultValues } = props;
    const { handleSubmit, control, watch, reset, trigger, setValue } = useForm<T>({
        mode: 'onChange',
        defaultValues: {
            ...defaultValues,
        },
    });
    const forms: FormItemsProps[] = useFormItems({ formItems });
    const formValuesRef = useRef<T>();

    // Listen to changes in all form fields
    const formValues = watch();

    useEffect(() => {
        const values: any = {};
        defaultValues &&
            Object.keys(defaultValues)?.forEach((key: string) => {
                if (defaultValues[key] !== undefined) {
                    values[key] = defaultValues[key];
                }
            });
        !!Object.keys(values)?.length && reset(defaultValues);
    }, [defaultValues, reset]);

    useEffect(() => {
        const values: any = {};
        Object.keys(formValues)?.forEach((key: string) => {
            if (formValues[key] !== undefined) {
                values[key] = formValues[key];
            }
        });
        if (
            (!formValuesRef?.current || !isEqual(formValuesRef?.current, formValues)) &&
            !!Object.keys(values)?.length
        ) {
            formValuesRef.current = { ...formValuesRef?.current, ...formValues };
            // Form value change callback
            !!onChange && onChange({ ...formValuesRef?.current, ...formValues });
        }
    }, [formValues]);

    const onSubmit: SubmitHandler<T> = async (data: T) => {
        const result = await trigger(); // Manually trigger validation
        if (result) {
            // To filter out fields that are not currently in the form.
            const resultData: Record<string, any> = {};
            const keys: string[] = [];
            forms.forEach((item: FormItemsProps) => {
                keys.push(item.name);
                if (item?.children?.length) {
                    item?.children?.forEach(subItem => {
                        keys.push(subItem.name);
                    });
                }
            });
            Object.keys(data)?.forEach(key => {
                if (keys.includes(key)) {
                    resultData[key] = data[key];
                }
            });
            await onOk(resultData as T);
        } else {
            console.error('Validation failed');
        }
    };

    /** How to expose to the father's component */
    useImperativeHandle(ref, () => ({
        reset,
        setValue,
        handleSubmit: handleSubmit(onSubmit),
    }));

    const renderMulForm = (index: number) => {
        const list =
            forms.filter(
                (item, i) =>
                    item.multiple && i >= index && i < index + (item?.multipleIndex || 0) + 1,
            ) || [];
        if (!list?.length) {
            return null;
        }
        const title = list[0]?.title;
        return (
            <div style={list[0].style as any} className="form-box">
                {title ? (
                    <div className="form-box-label">
                        <Tooltip title={title}>
                            <span>{title}</span>
                        </Tooltip>
                    </div>
                ) : null}
                {list.map((item: FormItemsProps) => {
                    return <Controller<T> key={item.name} {...item} control={control} />;
                })}
            </div>
        );
    };

    const renderChildrenForm = (item: FormItemsProps) => {
        return (
            <div style={item.style as any} className="form-box">
                {item?.label ? <div className="form-box-label">{item?.label}</div> : null}
                <Box sx={{ flexGrow: 1 }} className="form-box-contain">
                    <Grid container>
                        {item?.children?.map((subItem: FormItemsProps) => {
                            const size: number = subItem.col || (subItem.customRender ? 12 : 6);
                            return (
                                <Grid xs={size}>
                                    <div className="form-box-item">
                                        {subItem.customRender ? (
                                            subItem.customRender()
                                        ) : (
                                            <Controller<T>
                                                key={subItem.name}
                                                {...subItem}
                                                control={control}
                                            />
                                        )}
                                    </div>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
            </div>
        );
    };

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <div className="form-contain">
            {forms?.map((item: FormItemsProps, index: number) => {
                if (item.multiple) {
                    return item.multipleIndex === 0 ? renderMulForm(index) : null;
                }
                if (item.children?.length) {
                    return renderChildrenForm(item);
                }
                if (item.customRender) {
                    return item.customRender();
                }
                return <Controller<T> key={item.name} {...item} control={control} />;
            })}
        </div>
    );
};

/**
 * @deprecated Please use `react-hook-form` library directly for clearer and
 * more flexible control
 */
export const ForwardForms = forwardRef(Forms) as unknown as <T extends FieldValues>(
    props: React.PropsWithChildren<formProps<T>> & {
        ref?: React.ForwardedRef<formProps<T>>;
    },
) => React.ReactElement;

export default ForwardForms;
