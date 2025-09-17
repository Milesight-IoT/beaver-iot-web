import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { v4 } from 'uuid';
import cls from 'classnames';
import { useMemoizedFn } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelToSnake } from '@milesight/shared/src/utils/tools';
import { Modal, toast, type ModalProps } from '@milesight/shared/src/components';
import { entityAPI, awaitWrap, isRequestSuccess, EntityAPISchema } from '@/services/http';
import { ENTITY_ACCESS_MODE, ENTITY_TYPE, ENTITY_VALUE_TYPE } from '@/constants';
import { TableRowDataType } from '../../hooks/useColumns';
import useFormItems, { ENUM_TYPE_VALUE, type FormDataProps } from './useFormItems';

interface Props extends Omit<ModalProps, 'onOk'> {
    data?: TableRowDataType | null;

    /** is copy to add entity */
    isCopyAddEntity: boolean;

    /** Add a failed callback */
    onError?: (err: any) => void;

    /** Adding a successful callback */
    onSuccess?: () => void;
}

const AddModal: React.FC<Props> = ({
    visible,
    data,
    isCopyAddEntity,
    onCancel,
    onError,
    onSuccess,
    ...props
}) => {
    const { getIntlText } = useI18n();
    const entityId = data?.entityId;
    // ---------- Render form items ----------
    const [disabled, setDisabled] = useState(false);
    const { control, formState, watch, handleSubmit, reset, setValue } = useForm<FormDataProps>({
        shouldUnregister: true,
    });
    const formItems = useFormItems();
    const valueType = watch('valueType');
    const dataType = watch('dataType') || 'value';

    useEffect(() => {
        // Fixed when using setValue, watch return undefined
        setTimeout(() => {
            if (data?.entityId) {
                const { entityValueType, entityValueAttribute } = data;
                const {
                    min,
                    max,
                    minLength,
                    maxLength,
                    enum: enums,
                    unit,
                } = entityValueAttribute || {};

                setDisabled(true);
                setValue('name', data.entityName);
                setValue('identifier', data.entityKey?.split('.').pop() || '');
                setValue('accessMod', data.entityAccessMod, { shouldDirty: true });
                setValue('valueType', data.entityValueType);

                if (enums) {
                    if (entityValueType === 'BOOLEAN') {
                        setValue('boolEnumTrue', enums.true);
                        setValue('boolEnumFalse', enums.false);
                    } else {
                        setValue('dataType', 'enums');
                        // copy entity dataType default value cause data not display
                        setTimeout(() => {
                            setValue('enums', enums);
                        }, 50);
                    }
                } else {
                    setValue('dataType', 'value');

                    // isNumeric prop is number will valid fail
                    if (entityValueType === 'LONG' || entityValueType === 'DOUBLE') {
                        setValue('min', String(min));
                        setValue('max', String(max));
                    } else {
                        setValue('minLength', minLength ? String(minLength) : '');
                        setValue('maxLength', String(maxLength));
                    }
                }

                if (unit) {
                    setValue('unit', unit);
                }

                // add entity by copy
                if (isCopyAddEntity) {
                    setDisabled(false);
                    setValue('name', data?.entityName);
                    setValue('identifier', v4().replace(/-/g, ''));
                }
                // is enum type
                if (
                    data.entityValueType === ENTITY_VALUE_TYPE.STRING &&
                    !!data.entityValueAttribute?.enum &&
                    !!data.entityValueAttribute?.isEnum
                ) {
                    setValue('valueType', ENUM_TYPE_VALUE as EntityValueDataType);
                    setValue('dataType', 'value');
                }
            } else {
                setValue('dataType', 'value');
                setValue('identifier', v4().replace(/-/g, ''));
                setValue('accessMod', ENTITY_ACCESS_MODE.R);
            }
        });
    }, [data, setValue]);

    // ---------- Cancel & Submit ----------
    const handleCancel = useMemoizedFn(() => {
        reset();
        onCancel?.();
    });

    const assemblyBoolEnums = (
        boolEnumTrue: string | undefined,
        boolEnumFalse: string | undefined,
    ) => {
        return {
            true: boolEnumTrue,
            false: boolEnumFalse,
        };
    };

    // get edit type enums data
    const getEditAttributeEnum = (formData: FormDataProps) => {
        if (
            [ENTITY_VALUE_TYPE.STRING, ENTITY_VALUE_TYPE.LONG].includes(
                data?.entityValueType as ENTITY_VALUE_TYPE,
            ) &&
            !!data?.entityValueAttribute.enum
        ) {
            return data?.entityValueAttribute?.isEnum
                ? formData.enums
                : data?.entityValueAttribute.enum;
        }
        if ((data?.entityValueType as ENTITY_VALUE_TYPE) === ENTITY_VALUE_TYPE.BOOLEAN) {
            return data?.entityValueAttribute.enum;
        }
        return undefined;
    };

    const onSubmit: SubmitHandler<FormDataProps> = useMemoizedFn(async formData => {
        // Edit entity
        if (entityId && !isCopyAddEntity) {
            const { name, unit, enums } = formData;
            const params: EntityAPISchema['editEntity']['request'] = {
                id: entityId,
                name,
                value_attribute: {
                    ...objectToCamelToSnake(data.entityValueAttribute),
                    enum: getEditAttributeEnum(formData),
                    unit,
                },
            };

            if (
                ![
                    ENTITY_VALUE_TYPE.STRING,
                    ENTITY_VALUE_TYPE.LONG,
                    ENTITY_VALUE_TYPE.DOUBLE,
                ].includes(data?.entityValueType as ENTITY_VALUE_TYPE)
            ) {
                delete params?.value_attribute?.unit;
            }

            const [err, resp] = await awaitWrap(entityAPI.editEntity(params));

            if (err || !isRequestSuccess(resp)) {
                onError?.(err);
            } else {
                onSuccess?.();
                toast.success(getIntlText('common.message.operation_success'));
            }

            return;
        }

        // Add or copy Add entity
        const {
            name,
            identifier,
            accessMod,
            valueType,
            dataType = 'value',
            min,
            max,
            minLength,
            maxLength,
            enums,
            boolEnumTrue,
            boolEnumFalse,
            unit,
        } = formData;
        const valueAttribute: Record<string, any> = {};

        switch (valueType) {
            case 'BOOLEAN':
                valueAttribute.enum = assemblyBoolEnums(boolEnumTrue, boolEnumFalse);
                break;
            case 'LONG':
                valueAttribute.min = min;
                valueAttribute.max = max;
                valueAttribute.unit = unit;
                break;
            case 'DOUBLE':
                valueAttribute.min = min;
                valueAttribute.max = max;
                valueAttribute.unit = unit;
                break;
            case 'STRING':
                minLength && (valueAttribute.min_length = minLength);
                valueAttribute.max_length = maxLength;
                valueAttribute.unit = unit;
                break;
            // current corresponding ENUM
            case ENUM_TYPE_VALUE as EntityValueDataType:
                valueAttribute.enum = enums;
                // Distinguish the enumerations of the time-new string data types
                valueAttribute.is_enum = true;
                break;
            default:
                break;
        }

        const [err, resp] = await awaitWrap(
            entityAPI.createCustomEntity({
                name,
                identifier,
                type: ENTITY_TYPE.PROPERTY,
                access_mod: accessMod,
                value_type: valueType.split('-')[0] as EntityValueDataType,
                value_attribute: valueAttribute,
            }),
        );

        if (err || !isRequestSuccess(resp)) {
            onError?.(err);
            return;
        }

        onSuccess?.();
        toast.success(getIntlText('common.message.add_success'));
    });

    // get form item disabled status
    const getDisabledCol = useMemoizedFn((props: any) => {
        if (['name', 'unit'].includes(props.name)) {
            return false;
        }

        if (
            props.name === 'enums' &&
            data?.entityValueType === ENTITY_VALUE_TYPE.STRING &&
            data?.entityValueAttribute?.isEnum
        ) {
            return false;
        }
        return true;
    });

    return (
        <Modal
            size="lg"
            visible={visible}
            title={getIntlText('entity.label.create_entity_only')}
            className={cls('ms-add-entity-modal', { loading: formState.isSubmitting })}
            onOkText={getIntlText('common.button.save')}
            onOk={handleSubmit(onSubmit)}
            onCancel={handleCancel}
            {...props}
        >
            {formItems.map(({ shouldRender, ...props }) => {
                const formData = {
                    isEdit: !!data && !isCopyAddEntity,
                    entityValueAttribute: data?.entityValueAttribute,
                    valueType: entityId && !isCopyAddEntity ? data.entityValueType : valueType,
                    dataType:
                        entityId && !isCopyAddEntity
                            ? data.entityValueAttribute?.enum
                                ? 'enums'
                                : 'value'
                            : dataType,
                };

                if (shouldRender && !shouldRender(formData)) return null;
                return (
                    <Controller<FormDataProps>
                        {...props}
                        key={props.name}
                        control={control}
                        disabled={disabled && getDisabledCol(props)}
                    />
                );
            })}
        </Modal>
    );
};

export default AddModal;
