import { useMemo, forwardRef } from 'react';
import Form from '../form';
import { rulesType, UseFormItemsProps } from '../form/typings';
import { entityType } from './constant';
import type { EntityFormProps } from './typings';

const EntityForm = forwardRef((props: EntityFormProps, ref: any) => {
    const { entities, onOk } = props;

    // Get component type
    const getComponentType = (entity: EntitySchema & EntityData) => {
        const attr: any = entity?.value_attribute || {};
        const type: any = entity?.entity_value_type;
        const enumMap = attr?.enum || {};
        switch (type) {
            case entityType.string:
            case entityType.long:
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

    // Get component configuration
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
            case entityType.double:
            case entityType.long:
                componentProps.type = 'number';
                break;
            default:
        }
        return componentProps;
    };

    // Gets component verification rules
    const getComponentRules = (entity: EntitySchema & EntityData) => {
        const attr: any = entity?.value_attribute || {};
        const type: any = entity?.entity_value_type;
        const rules: rulesType = {
            required: Boolean(!attr?.optional),
        };
        switch (type) {
            case entityType.string:
                if (attr.min_length) {
                    rules.minLength = {
                        value: attr.min_length,
                        message: `最小长度为${attr.min_length}`,
                    };
                }
                if (attr.max_length) {
                    rules.maxLength = {
                        value: attr.max_length,
                        message: `最大长度为${attr.max_length}`,
                    };
                }
                break;
            case entityType.double:
            case entityType.long:
                if (attr.min) {
                    rules.min = { value: attr.min, message: `最小值为${attr.min}` };
                }
                if (attr.max) {
                    rules.max = { value: attr.max, message: `最大值为${attr.max}` };
                }
                break;
            case entityType.boolean:
                // if switch has required will validate fail then click not response
                rules.required = false;
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
