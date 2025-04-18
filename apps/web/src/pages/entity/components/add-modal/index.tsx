import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { v4 } from 'uuid';
import cls from 'classnames';
import { useMemoizedFn } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal, toast, type ModalProps } from '@milesight/shared/src/components';
import { entityAPI, awaitWrap, isRequestSuccess, EntityAPISchema } from '@/services/http';
import { ENTITY_TYPE, ENTITY_VALUE_TYPE } from '@/constants';
import { TableRowDataType } from '../../hooks/useColumns';
import useFormItems, { type FormDataProps } from './useFormItems';

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
                        setValue('boolEnums', enums);
                    } else {
                        setValue('dataType', 'enums');
                        // copy entity dataType default value cause data not display
                        setTimeout(() => {
                            setValue('enums', enums);
                        }, 50);
                    }
                } else {
                    setValue('dataType', 'value');

                    if (entityValueType === 'LONG' || entityValueType === 'DOUBLE') {
                        setValue('min', min);
                        setValue('max', max);
                    } else {
                        setValue('minLength', minLength);
                        setValue('maxLength', maxLength);
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
            } else {
                setValue('dataType', 'value');
                setValue('identifier', v4().replace(/-/g, ''));
            }
        });
    }, [data, setValue]);

    // ---------- Cancel & Submit ----------
    const handleCancel = useMemoizedFn(() => {
        reset();
        onCancel?.();
    });

    const onSubmit: SubmitHandler<FormDataProps> = useMemoizedFn(async (formData, all) => {
        // Edit entity
        if (entityId && !isCopyAddEntity) {
            const { name, unit } = formData;
            const params: EntityAPISchema['editEntity']['request'] = {
                id: entityId,
                name,
                value_attribute: {
                    ...data.entityValueAttribute,
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

        // Add entity
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
            boolEnums,
            unit,
        } = formData;
        const valueAttribute: Record<string, any> = {};

        switch (valueType) {
            case 'BOOLEAN':
                valueAttribute.enum = boolEnums;
                break;
            case 'LONG':
                if (dataType === 'enums') {
                    valueAttribute.enum = enums;
                } else {
                    valueAttribute.min = min;
                    valueAttribute.max = max;
                }
                valueAttribute.unit = unit;
                break;
            case 'DOUBLE':
                valueAttribute.min = min;
                valueAttribute.max = max;
                valueAttribute.unit = unit;
                break;
            case 'STRING':
                if (dataType === 'enums') {
                    valueAttribute.enum = enums;
                } else {
                    valueAttribute.min_length = minLength;
                    valueAttribute.max_length = maxLength;
                }
                valueAttribute.unit = unit;
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
                value_type: valueType,
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
                        disabled={disabled && !['name', 'unit'].includes(props.name)}
                    />
                );
            })}
        </Modal>
    );
};

export default AddModal;
