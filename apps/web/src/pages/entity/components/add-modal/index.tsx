import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal, Form } from '@milesight/shared/src/components';
import { entityAPI, awaitWrap, isRequestSuccess } from '@/services/http';
import { ENTITY_TYPE } from '@/constant';
import { TableRowDataType } from '../../hooks/useColumns';
import useForm from './useForm';

interface IProps {
    onCancel: () => void;
    onOk: (data: Record<string, any>) => void;
    data?: TableRowDataType | null;
}

const AddEntity = (props: IProps) => {
    const { getIntlText } = useI18n();
    const { onOk, onCancel, data } = props;
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [defaultValues, setDefaultValues] = useState<Record<string, any>>();
    const formRef = useRef<any>();
    const formValuesRef = useRef<Record<string, any>>({});

    const setFormValuesRef = (values: Record<string, any>) => {
        formValuesRef.current = { ...values };
    };

    const formItems = useForm({
        formValues,
        data,
        defaultValues,
        preFormValues: { ...formValuesRef.current },
        setPreFormValues: setFormValuesRef,
    });

    const handleClose = () => {
        onCancel();
    };

    const handleOk = () => {
        formRef.current?.handleSubmit();
    };

    // Form submission
    const handleSubmit = async (values: Record<string, any>) => {
        const resultValues: Record<string, any> = { value_attribute: {} };
        Object.keys(values).forEach((key: string) => {
            if (key.indexOf(`temp_${values.value_type}_key_`) > -1) {
                if (!resultValues.value_attribute.enum) {
                    resultValues.value_attribute.enum = {};
                }
                resultValues.value_attribute.enum[values[key]] =
                    values[key.replace('key', 'value')];
            } else if (
                key.indexOf(`temp_${values.value_type}_value_`) > -1 &&
                values.value_type === 'BOOLEAN'
            ) {
                if (!resultValues.value_attribute.enum) {
                    resultValues.value_attribute.enum = {};
                }
                const keyIndex = Number(key.replace(`temp_${values.value_type}_value_`, '')) || 1;
                resultValues.value_attribute.enum[keyIndex === 1 ? 'true' : 'false'] = values[key];
            } else if (['min', 'max', 'minLength', 'maxLength'].includes(key)) {
                resultValues.value_attribute[key] = values[key];
            } else if (key.indexOf(`temp_${values.value_type}_value_`) === -1) {
                resultValues[key] = values[key];
            }
        });
        const fun = data?.entityId ? entityAPI.editCustomEntity : entityAPI.createCustomEntity;
        const [err, res] = await awaitWrap(
            fun({
                ...(resultValues as any),
                type: ENTITY_TYPE.PROPERTY,
                entityId: data?.entityId,
            }),
        );
        if (!err && isRequestSuccess(res)) {
            onOk(resultValues);
        }
    };

    useEffect(() => {
        if (data) {
            const resultFormValues: Record<string, any> = {
                name: data.entityName,
                identifier: data.identifier,
                access_mod: data.entityAccessMod,
                value_type: data.entityValueType,
            };
            if (data.entityValueAttribute?.enum) {
                Object.keys(data.entityValueAttribute.enum).forEach(
                    (key: string, index: number) => {
                        resultFormValues[`temp_${data.entityValueType}_key_${index + 1}`] = key;
                        resultFormValues[`temp_${data.entityValueType}_value_${index + 1}`] =
                            data.entityValueAttribute.enum[key];
                    },
                );
            } else if (data.entityValueAttribute?.min || data.entityValueAttribute?.min === 0) {
                resultFormValues.min = data.entityValueAttribute.min;
                resultFormValues.max = data.entityValueAttribute.max;
            } else if (
                data.entityValueAttribute?.minLength ||
                data.entityValueAttribute?.minLength === 0
            ) {
                resultFormValues.minLength = data.entityValueAttribute.minLength;
                resultFormValues.maxLength = data.entityValueAttribute.maxLength;
            }
            if (data?.entityKey) {
                resultFormValues.identifier =
                    data.entityKey.split('.')[data.entityKey.split('.').length - 1];
            }
            setFormValues(resultFormValues);
            setDefaultValues(resultFormValues);
        }
    }, [data]);

    const handleChange = (values: any) => {
        setFormValues(values);
    };

    return (
        <Modal
            visible
            onCancel={handleClose}
            onOk={handleOk}
            onOkText={getIntlText('common.label.create')}
            title={getIntlText('entity.label.create_entity_only')}
            size="lg"
        >
            <Form<TableRowDataType>
                ref={formRef}
                formItems={formItems}
                onOk={handleSubmit}
                onChange={handleChange}
            />
        </Modal>
    );
};

export default AddEntity;
