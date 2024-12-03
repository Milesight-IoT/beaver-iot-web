import { useMemo, forwardRef } from 'react';
import Form from '../form';
import { rulesType, UseFormItemsProps } from '../form/typings';
import { entityType } from './constant';
import type { EntityFormProps } from './typings';

const EntityForm = forwardRef((props: EntityFormProps, ref: any) => {
    const { entities, onOk } = props;

    // 获取组件类型
    const getComponentType = (entity: EntitySchema & EntityData) => {
        const attr: any = entity?.value_attribute || {};
        const type: any = entity?.entity_value_type;
        const enumMap = attr?.enum || {};
        switch (type) {
            case entityType.string:
            case entityType.int:
            case entityType.float:
                if (type === entityType.string && Object.keys(enumMap)?.length) {
                    return 'Select';
                }
                return 'TextField';
            case entityType.boolean:
                return 'Switch';
            case entityType.date:
                return 'DatePicker';
            case entityType.enum:
                return 'Select';
            default:
                return 'TextField';
        }
    };

    // 获取组件配置
    const getComponentProps = (entity: EntitySchema & EntityData, resultType?: string) => {
        const attr: any = entity?.value_attribute || {};
        const type = resultType || entity?.entity_value_type;
        const keys = Object.keys(attr?.enum || {});
        const componentProps: any = {};
        switch (type) {
            case entityType.enum:
                componentProps.options = keys?.map((key: string) => {
                    return { label: attr?.enum[key], value: key };
                });
                break;
            case entityType.int:
            case entityType.float:
                componentProps.type = 'number';
                break;
            default:
        }
        return componentProps;
    };

    // 获取组件校验规则
    const getComponentRules = (entity: EntitySchema & EntityData) => {
        const attr: any = entity?.value_attribute || {};
        const type: any = entity?.entity_value_type;
        const rules: rulesType = {};
        switch (type) {
            case entityType.string:
                if (attr.minLength) {
                    rules.minLength = {
                        value: attr.minLength,
                        message: `最小长度为${attr.minLength}`,
                    };
                }
                if (attr.maxLength) {
                    rules.maxLength = {
                        value: attr.maxLength,
                        message: `最大长度为${attr.maxLength}`,
                    };
                }
                break;
            case entityType.int:
            case entityType.float:
                if (attr.min) {
                    rules.min = { value: attr.min, message: `最小值为${attr.min}` };
                }
                if (attr.max) {
                    rules.max = { value: attr.max, message: `最大值为${attr.max}` };
                }
                break;
            default:
        }
        return rules;
    };

    const formItems: Record<string, any> = useMemo(() => {
        if (entities?.length) {
            const forms: UseFormItemsProps[] = [];
            const defaultValues: Record<string, any> = {};
            entities.forEach((entity: any) => {
                const type = getComponentType(entity);
                const componentProps = {
                    ...getComponentProps(entity, type === 'Select' ? entityType.enum : ''),
                    size: 'small',
                    isFullWidth: true,
                    className: 'form-item',
                };
                if (entity?.entity_value_type !== entityType.boolean) {
                    componentProps.style = { width: '100%' };
                } else {
                    defaultValues[entity.key] = false;
                }
                if (type === 'Select') {
                    defaultValues[entity.key] = componentProps.options[0]?.value;
                }
                const item: UseFormItemsProps = {
                    label: entity.entity_name,
                    name: entity.key,
                    type: getComponentType(entity),
                    props: componentProps,
                    rules: getComponentRules(entity),
                };
                forms.push(item);
            });
            return {
                forms,
                defaultValues,
            };
        }
        return {};
    }, [entities]);

    console.log({ formItems });
    return (
        <Form
            formItems={formItems.forms || []}
            defaultValues={formItems.defaultValues || {}}
            onOk={onOk}
            ref={ref}
        />
    );
});

export default EntityForm;
