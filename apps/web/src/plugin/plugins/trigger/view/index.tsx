import { useState, useRef, useMemo, useEffect } from 'react';

import { Modal, EntityForm, toast } from '@milesight/shared/src/components';
import { useI18n } from '@milesight/shared/src/hooks';
import { flattenObject, objectToCamelToSnake } from '@milesight/shared/src/utils/tools';
import * as Icons from '@milesight/shared/src/components/icons';

import { useConfirm } from '@/components';
import { ENTITY_DATA_VALUE_TYPE, ENTITY_VALUE_TYPE } from '@/constants';
import { Tooltip } from '../../../view-components';
import { useEntityApi, useActivityEntity, type CallServiceType } from '../../../hooks';
import { ViewConfigProps } from './typings';
import './style.less';

interface Props {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    config: ViewConfigProps;
    configJson: CustomComponentProps;
    isEdit?: boolean;
    mainRef: any;
}

const View = (props: Props) => {
    const { getIntlText } = useI18n();
    const confirm = useConfirm();
    const { getEntityChildren, callService, updateProperty } = useEntityApi();
    const { getLatestEntityDetail } = useActivityEntity();
    const { config, configJson, widgetId, dashboardId, isEdit, mainRef } = props;
    const { label, icon, bgColor, entity } = config || {};
    const [visible, setVisible] = useState(false);
    const [entities, setEntities] = useState();
    // OBJECT type entity
    const [objectEntities, setObjectEntities] = useState<EntityData[]>([]);
    const ref = useRef<any>();
    const tempRef = useRef<any>({});

    const latestEntity = useMemo(() => {
        if (!entity) return {};
        return getLatestEntityDetail(entity);
    }, [entity, getLatestEntityDetail]);

    // Call service
    const handleCallService = async (data: Record<string, any>) => {
        const { error } = await callService({
            entity_id: (latestEntity as any)?.value as ApiKey,
            exchange: data,
        } as CallServiceType);
        if (!error) {
            setVisible(false);
            toast.success({
                key: 'callService',
                content: getIntlText('common.message.operation_success'),
            });
        }
    };

    const handleUpdateProperty = async (data: Record<string, any>) => {
        const { error } = await updateProperty({
            entity_id: (latestEntity as any)?.value as ApiKey,
            exchange: data,
        } as CallServiceType);
        if (!error) {
            setVisible(false);
            toast.success({
                key: 'updateProperty',
                content: getIntlText('common.message.operation_success'),
            });
        }
    };

    const handleClick = async () => {
        if (configJson.isPreview || isEdit) {
            return;
        }
        const { error, res } = await getEntityChildren({
            id: (latestEntity as any)?.value as ApiKey,
        });
        const entityType = latestEntity?.rawData?.entityType;
        const valueType = latestEntity?.rawData?.entityValueType;
        if (!error) {
            let list = res || [];
            if (valueType !== ENTITY_DATA_VALUE_TYPE.OBJECT && !list.length) {
                list = [objectToCamelToSnake(latestEntity?.rawData)];
            }
            const children =
                list?.filter((childrenItem: EntityData) => {
                    return childrenItem?.entity_access_mod?.indexOf('W') > -1;
                }) || [];
            if (children?.length) {
                const objectEntityList: EntityData[] = children.filter((v: EntityData) => {
                    return (
                        v.entity_value_type === ENTITY_DATA_VALUE_TYPE.OBJECT &&
                        (!v.entity_value_attribute ||
                            JSON.stringify(v.entity_value_attribute) === '{}')
                    );
                });
                // If it is of the OBJECT type, it is not displayed and the value is{}
                const entityList = children
                    .filter(
                        (childrenItem: EntityData) =>
                            !objectEntityList.find(
                                (v: EntityData) => v.entity_id === childrenItem.entity_id,
                            ),
                    )
                    .map((item: EntityData, index: number) => {
                        tempRef.current[`tempTemp-${index}`] = item.entity_key;
                        return {
                            ...item,
                            id: item.entity_id,
                            key: `tempTemp-${index}`,
                            name: item.entity_name,
                            value_attribute: item.entity_value_attribute,
                        };
                    });
                setEntities(entityList);
                setObjectEntities(objectEntityList);
                setVisible(true);
            } else {
                confirm({
                    title: '',
                    description: getIntlText('dashboard.plugin.trigger_confirm_text'),
                    confirmButtonText: getIntlText('common.button.confirm'),
                    onConfirm: async () => {
                        const entityKey = (latestEntity as any).rawData?.entityKey;
                        // If the entity itself is the object default is {}, otherwise it is null
                        const resultValue = valueType === ENTITY_DATA_VALUE_TYPE.OBJECT ? {} : null;
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
                        container: mainRef.current,
                        disableScrollLock: true,
                    },
                });
            }
        }
    };

    const handleOk = async () => {
        await ref.current?.handleSubmit();
    };

    const handleSubmit = async (data: Record<string, any>) => {
        const newData: any = flattenObject(data);
        const keys = Object.keys(newData);
        const resultData: any = {};
        keys.forEach((key: string) => {
            resultData[tempRef.current[key]] = newData[key];
        });
        // If it is of the OBJECT type, it is not displayed and the value is{}
        objectEntities.forEach(v => {
            resultData[v.entity_key] = {};
        });
        const entityType = latestEntity?.rawData?.entityType;
        if (entityType === 'PROPERTY') {
            await handleUpdateProperty(resultData);
        } else if (entityType === 'SERVICE') {
            await handleCallService(resultData);
        }
    };

    // ---------- Entity status management ----------
    const { addEntityListener } = useActivityEntity();

    useEffect(() => {
        const entityId = entity?.value;
        if (!widgetId || !dashboardId || !entityId) return;

        const removeEventListener = addEntityListener(entityId, {
            widgetId,
            dashboardId,
        });

        return () => {
            removeEventListener();
        };
    }, [entity?.value, widgetId, dashboardId, addEntityListener]);

    /**
     * Icon component
     */
    const IconComponent = useMemo(() => {
        const IconShow = Reflect.get(Icons, icon);
        if (!IconShow) return null;

        return <IconShow sx={{ fontSize: 24 }} />;
    }, [icon]);

    if (configJson.isPreview) {
        return (
            <div className="trigger-view-preview" style={{ backgroundColor: bgColor }}>
                {IconComponent}
                <div className="trigger-view__label">
                    <Tooltip className="trigger-view__text" autoEllipsis title={label} />
                </div>
            </div>
        );
    }

    return (
        <>
            <div
                className="trigger-view"
                style={{ backgroundColor: bgColor }}
                onClick={handleClick}
            >
                {IconComponent}
                <div className="trigger-view__label">
                    <Tooltip className="trigger-view__text" autoEllipsis title={label} />
                </div>
            </div>
            {visible && !!mainRef.current && (
                <Modal
                    title={configJson.name}
                    onOk={handleOk}
                    onCancel={() => setVisible(false)}
                    container={mainRef.current}
                    visible
                    disableScrollLock
                >
                    <div className="trigger-view-form">
                        {/* @ts-ignore: Mock data field is missing, temporarily ignore the TS verification error */}
                        <EntityForm ref={ref} entities={entities} onOk={handleSubmit} />
                    </div>
                </Modal>
            )}
        </>
    );
};

export default View;
