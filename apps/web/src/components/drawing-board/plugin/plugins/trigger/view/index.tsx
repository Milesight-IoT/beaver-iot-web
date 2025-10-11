import { useState, useMemo, useEffect } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { get } from 'lodash-es';
import cls from 'classnames';

import { Modal, toast } from '@milesight/shared/src/components';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import * as Icons from '@milesight/shared/src/components/icons';

import { ENTITY_DATA_VALUE_TYPE } from '@/constants';
import { entityAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import { useConfirm } from '@/components';
import {
    useEntityFormItems,
    type EntityFormDataProps,
    type UseEntityFormItemsProps,
} from '@/hooks';
import { Tooltip } from '../../../view-components';
import { useActivityEntity, useGridLayout } from '../../../hooks';
import { ViewConfigProps } from './typings';
import type { BoardPluginProps } from '../../../types';
import './style.less';

interface Props {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    config: ViewConfigProps;
    configJson: BoardPluginProps;
    isEdit?: boolean;
    mainRef: any;
}

const View = (props: Props) => {
    const { config, configJson, widgetId, dashboardId, isEdit } = props;
    const { label, icon, bgColor, entity } = config || {};
    const { isPreview, name: pluginName, pos } = configJson || {};

    const { getIntlText } = useI18n();
    const confirm = useConfirm();
    const { getLatestEntityDetail } = useActivityEntity();
    const { wGrid = 2, hGrid = 1 } = useGridLayout(pos);

    const [visible, setVisible] = useState(false);

    const latestEntity = useMemo(() => {
        if (!entity) return;
        return getLatestEntityDetail(entity as EntityOptionType);
    }, [entity, getLatestEntityDetail]);

    // Call service
    const handleCallService = async (data: Record<string, any>) => {
        const entityId = latestEntity?.value;

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
        const entityId = latestEntity?.value;

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

    // ---------- Entity Form Items ----------
    const { control, handleSubmit, getValues, reset } = useForm<EntityFormDataProps>({
        shouldUnregister: true,
    });
    const [formEntities, setFormEntities] = useState<UseEntityFormItemsProps['entities']>();
    const { formItems, decodeFormParams } = useEntityFormItems({
        entities: formEntities,
    });

    // Handle trigger card click
    const handleClick = async () => {
        const entityRawData = latestEntity?.rawData;
        const { entityKey, entityType, entityValueType } = entityRawData || {};
        if (isPreview || isEdit || !latestEntity || !entityKey) {
            return;
        }
        const [error, resp] = await awaitWrap(
            entityAPI.getChildrenEntity({ id: latestEntity.value }),
        );

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
            entityRawData &&
            !result.length &&
            !(['BINARY', 'ENUM', 'OBJECT'] as EntityValueDataType[]).includes(entityValueType!)
        ) {
            result.push({
                id: entityRawData.entityId,
                key: entityRawData.entityKey,
                name: entityRawData.entityName,
                type: entityRawData.entityType,
                valueAttribute: entityRawData.entityValueAttribute,
                valueType: entityRawData.entityValueType,
                accessMod: entityRawData.entityAccessMod,
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
                const resultValue = entityValueType === ENTITY_DATA_VALUE_TYPE.OBJECT ? {} : null;
                if (entityType === 'SERVICE') {
                    await handleCallService({
                        [entityKey]: resultValue,
                    });
                } else if (entityType === 'PROPERTY') {
                    await handleUpdateProperty({
                        [entityKey]: resultValue,
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
        const entityId = latestEntity?.value;
        const entityType = latestEntity?.rawData?.entityType;

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

    // ---------- Entity status management ----------
    const { addEntityListener } = useActivityEntity();

    useEffect(() => {
        const entityId = latestEntity?.value;
        if (!widgetId || !dashboardId || !entityId) return;

        const removeEventListener = addEntityListener(entityId, {
            widgetId,
            dashboardId,
        });

        return () => {
            removeEventListener();
        };
    }, [latestEntity?.value, widgetId, dashboardId, addEntityListener]);

    // ---------- Icon component ----------
    const IconComponent = useMemo(() => {
        const IconShow = Reflect.get(
            Icons,
            get(config, 'appearanceIcon.icon', icon || 'AdsClickIcon'),
        );
        if (!IconShow) return null;

        return <IconShow sx={{ fontSize: wGrid > 1 && hGrid > 1 ? 32 : 24 }} />;
    }, [icon, config, wGrid, hGrid]);

    const renderTriggerView = (
        <div
            className={isPreview ? 'trigger-view-preview' : 'trigger-view'}
            style={{
                backgroundColor: get(config, 'appearanceIcon.color', bgColor || '#8E66FF'),
            }}
            onClick={handleClick}
        >
            {IconComponent}
            <div className="trigger-view__label">
                <Tooltip
                    className={cls('trigger-view__text', {
                        'text-lg': wGrid > 1 && hGrid > 1,
                    })}
                    autoEllipsis
                    title={label}
                />
            </div>
        </div>
    );

    if (isPreview) {
        return renderTriggerView;
    }

    return (
        <>
            {renderTriggerView}
            {visible && (
                <Modal
                    visible
                    title={label || pluginName}
                    onOk={handleSubmit(handleFormSubmit)}
                    onCancel={() => {
                        reset();
                        setVisible(false);
                    }}
                >
                    <div className="trigger-view-form">
                        {formItems.map(props => (
                            <Controller<EntityFormDataProps>
                                {...props}
                                key={props.name}
                                control={control}
                            />
                        ))}
                    </div>
                </Modal>
            )}
        </>
    );
};

export default View;
