import { useState, useRef, useContext } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useMemoizedFn } from 'ahooks';

import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { toast } from '@milesight/shared/src/components';
import { useI18n } from '@milesight/shared/src/hooks';

import {
    useEntityFormItems,
    type EntityFormDataProps,
    type UseEntityFormItemsProps,
} from '@/hooks';
import { useConfirm } from '@/components';
import {
    type ImportEntityProps,
    entityAPI,
    awaitWrap,
    isRequestSuccess,
    getResponseData,
} from '@/services/http';
import { ENTITY_DATA_VALUE_TYPE } from '@/constants';
import { DrawingBoardContext } from '@/components/drawing-board/context';

export function useCallService(isPreview?: boolean) {
    const [visible, setVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');

    const { getIntlText } = useI18n();
    const confirm = useConfirm();
    const { control, handleSubmit, getValues, reset } = useForm<EntityFormDataProps>({
        shouldUnregister: true,
    });
    const [formEntities, setFormEntities] = useState<UseEntityFormItemsProps['entities']>();
    const { formItems, decodeFormParams } = useEntityFormItems({
        entities: formEntities,
    });
    const context = useContext(DrawingBoardContext);
    const entityRef = useRef<ImportEntityProps>();

    // Call service
    const handleCallService = async (data: Record<string, any>) => {
        const entityId = entityRef.current?.id;

        if (!entityId) return;
        const [error, resp] = await awaitWrap(
            entityAPI.callService({
                entity_id: entityId,
                exchange: data,
            }),
        );

        if (error || !isRequestSuccess(resp)) return;

        reset();
        setVisible(false);
        toast.success({
            key: 'callService',
            content: getIntlText('common.message.operation_success'),
        });
    };

    // Update property
    const handleUpdateProperty = async (data: Record<string, any>) => {
        const entityId = entityRef.current?.id;

        if (!entityId) return;
        const [error, resp] = await awaitWrap(
            entityAPI.updateProperty({
                entity_id: entityId,
                exchange: data,
            }),
        );

        if (error || !isRequestSuccess(resp)) return;

        reset();
        setVisible(false);
        toast.success({
            key: 'updateProperty',
            content: getIntlText('common.message.operation_success'),
        });
    };

    // Handle call service operation click
    const handleServiceClick = async (entity?: ImportEntityProps) => {
        if (context?.isEdit || isPreview || !entity) {
            return;
        }

        entityRef.current = entity;

        const {
            id,
            key,
            name,
            type,
            value_type: valueType,
            value_attribute: entityValueAttribute,
            access_mod: accessMode,
        } = entity || {};
        if (!id || !key) {
            return;
        }

        setModalTitle(name);

        const [error, resp] = await awaitWrap(entityAPI.getChildrenEntity({ id }));
        if (error || !isRequestSuccess(resp)) return;

        const children = getResponseData(resp) || [];
        const result: UseEntityFormItemsProps['entities'] = children
            .filter(item => item.entity_access_mod?.indexOf('W') > -1)
            .map(item => {
                const valueAttribute = objectToCamelCase(item.entity_value_attribute!);

                if (valueAttribute?.enum) {
                    valueAttribute.enum = item.entity_value_attribute!.enum;
                }

                return {
                    id: item.entity_id,
                    key: item.entity_key,
                    name: item.entity_name,
                    type: item.entity_type,
                    valueAttribute,
                    valueType: item.entity_value_type,
                    accessMod: item.entity_access_mod,
                };
            });

        if (
            !result?.length &&
            !(['BINARY', 'ENUM', 'OBJECT'] as EntityValueDataType[]).includes(valueType!)
        ) {
            result.push({
                id,
                key,
                name,
                type,
                valueAttribute: entityValueAttribute,
                valueType,
                accessMod: accessMode,
            });
        }

        if (result.length) {
            setVisible(true);
            setFormEntities(result);
            return;
        }

        confirm({
            title: '',
            description: getIntlText('dashboard.plugin.trigger_confirm_text'),
            confirmButtonText: getIntlText('common.button.confirm'),
            onConfirm: async () => {
                // If the entity itself is the object default is {}, otherwise it is null
                const resultValue = valueType === ENTITY_DATA_VALUE_TYPE.OBJECT ? {} : null;
                if (type === 'SERVICE') {
                    await handleCallService({
                        [key]: resultValue,
                    });
                } else if (type === 'PROPERTY') {
                    await handleUpdateProperty({
                        [key]: resultValue,
                    });
                }
            },
            dialogProps: {
                // container: mainRef.current,
                disableScrollLock: true,
            },
        });
    };

    // Handle form submit
    const handleFormSubmit: SubmitHandler<EntityFormDataProps> = async () => {
        if (!formEntities?.length) return;
        const params = getValues();
        const finalParams = decodeFormParams(params);
        const entityId = entityRef.current?.id;
        const entityType = entityRef.current?.type;

        if (!entityId) return;
        if (!finalParams) {
            console.warn(`params is empty, the origin params is ${JSON.stringify(params)}`);
            return;
        }

        switch (entityType) {
            case 'SERVICE': {
                await handleCallService(finalParams);
                break;
            }
            case 'PROPERTY': {
                await handleUpdateProperty(finalParams);
                break;
            }
            default: {
                break;
            }
        }
    };

    /**
     * Hidden modal
     */
    const handleModalCancel = useMemoizedFn(() => {
        reset();
        setVisible(false);
    });

    return {
        visible,
        control,
        formItems,
        modalTitle,
        handleSubmit,
        handleFormSubmit,
        handleModalCancel,
        handleServiceClick,
    };
}
