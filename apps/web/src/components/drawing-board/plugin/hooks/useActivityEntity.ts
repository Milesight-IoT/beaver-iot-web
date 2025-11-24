import { useCallback } from 'react';
import { create } from 'zustand';
import { isUndefined, isNull, cloneDeep } from 'lodash-es';
import { useMemoizedFn } from 'ahooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { EventEmitter } from '@milesight/shared/src/utils/event-emitter';

type ListenerOptions = {
    widgetId?: ApiKey;
    dashboardId: ApiKey;
    callback?: (
        payload: any,
        options: Omit<ListenerOptions, 'callback'> & { entityId: ApiKey },
    ) => void;
    /**
     * Whether to add entity to record
     * @description If true, the entity will be added to the record that need to passed to backend
     */
    isRecord?: boolean;
};

type RecordEntityIdsProps = {
    dashboardId: ApiKey;
    widgetId?: ApiKey;
    entityId: ApiKey | ApiKey[];
    isRecord?: boolean;
};

interface ActivityEntityStore {
    /**
     * Entity details
     * @description The latest details of the entity that is currently being displayed in dashboard
     */
    entities?: Record<ApiKey, EntityData> | null;

    /**
     * Set latest entity details
     * @description Set the latest details of the entity that is currently being
     * displayed in dashboard
     */
    setLatestEntities: (entities: EntityData[]) => void;
}

const eventEmitter = new EventEmitter();
const TOPIC_SEPARATOR = '/';
const genTopic = (dashboardId: ApiKey, entityId: ApiKey) => {
    return `${dashboardId}${TOPIC_SEPARATOR}${entityId}`;
};

const useActivityEntityStore = create<ActivityEntityStore>(set => ({
    entities: {},
    setLatestEntities: entities => {
        const result: ActivityEntityStore['entities'] = {};

        (entities || []).forEach(entity => {
            result[entity.entity_id] = entity;
        });
        set({ entities: result });
    },
}));

type EntityPoolValue = {
    /** The timer for periodic batch pushing messages to the view */
    timer?: number | null;
    /** The entity list that wait to be triggered */
    entities?: ApiKey[] | null;
};

const entityPool: Record<ApiKey, EntityPoolValue> = {};
const setEntityPool = (dashboardId: ApiKey, { timer, entities }: EntityPoolValue) => {
    const result = entityPool?.[dashboardId] || {};

    if (!isUndefined(timer)) result.timer = timer;
    if (!isUndefined(entities)) {
        let ids: EntityPoolValue['entities'] = null;

        if (!isNull(entities)) {
            ids = Array.isArray(entities) ? entities : [entities];
            ids = [...new Set([...(result.entities || []), ...(ids || [])])];
        }

        result.entities = ids;
    }

    entityPool[dashboardId] = result;
};

/**
 * @description Collection of entity ids that need to passed to backend
 * @param dashboardId Dashboard id
 * @param widgetId Widget id
 * @param entityId Entity id
 */
const recordEntityIds = new Map<ApiKey, Map<ApiKey, ApiKey[]>>();

/**
 * Activity entity hook
 * @description The hook for managing the entity that is currently being displayed in dashboard
 */
const useActivityEntity = () => {
    const { entities, setLatestEntities } = useActivityEntityStore();

    const getLatestEntityDetail = useCallback(
        <T extends Partial<EntityOptionType> | Partial<EntityOptionType>[]>(entity: T): T => {
            const isArray = Array.isArray(entity);
            const oldEntities = isArray ? entity : [entity];
            const result = cloneDeep(oldEntities).map(entity => {
                const newEntity = entities?.[entity.value] || null;

                if (!newEntity) return entity;
                const newEntityData = objectToCamelCase(newEntity);

                if (newEntityData.entityValueAttribute?.enum) {
                    newEntityData.entityValueAttribute.enum =
                        newEntity.entity_value_attribute?.enum;
                }

                return {
                    ...entity,
                    label: newEntityData.entityName,
                    rawData: {
                        ...entity.rawData,
                        ...newEntityData,
                    },
                };
            });

            return isArray ? (result as T) : (result[0] as T);
        },
        [entities],
    );

    /**
     * @description Add entity id to record
     * @param entityId Entity id
     * @param dashboardId Dashboard id
     */
    const addEntityToRecord = useMemoizedFn((props: RecordEntityIdsProps) => {
        const { entityId, widgetId, dashboardId, isRecord } = props || {};
        if (!entityId || !dashboardId || !widgetId || !isRecord) return;

        const ids = Array.isArray(entityId) ? entityId : [entityId];
        const record = recordEntityIds.get(dashboardId);
        if (!record) {
            recordEntityIds.set(dashboardId, new Map([[widgetId, ids]]));
            return;
        }

        record.set(widgetId, ids);
    });

    /**
     * @description Remove entity id from record
     * @param entityId Entity id
     * @param dashboardId Dashboard id
     */
    const removeEntityFromRecord = useMemoizedFn((props: RecordEntityIdsProps) => {
        const { entityId, widgetId, dashboardId, isRecord } = props || {};
        if (!entityId || !dashboardId || !widgetId || !isRecord) return;

        const record = recordEntityIds.get(dashboardId);
        if (!record) return;

        /**
         * Remove entity id from record
         */
        record.delete(widgetId);
        /**
         * Remove dashboard id from record if it is empty
         */
        if (record.size === 0) {
            recordEntityIds.delete(dashboardId);
        }
    });

    /**
     * @description Get entity ids that need to passed to backend
     * @param dashboardId Dashboard id
     */
    const getRecordEntityIds = useMemoizedFn((dashboardId: ApiKey) => {
        const record = recordEntityIds.get(dashboardId);
        if (!record) return [];

        return [...new Set(Array.from(record.values()).flat())];
    });

    const addEntityListener = useCallback(
        (
            entityId: ApiKey | ApiKey[],
            { widgetId, dashboardId, callback = () => {}, isRecord = true }: ListenerOptions,
        ) => {
            const topics = !Array.isArray(entityId)
                ? [genTopic(dashboardId, entityId)]
                : entityId.map(entityId => genTopic(dashboardId, entityId));

            addEntityToRecord({
                entityId,
                widgetId,
                dashboardId,
                isRecord,
            });

            topics.forEach(topic => {
                eventEmitter.subscribe(topic, callback, { widgetId, dashboardId });
            });

            return () => {
                removeEntityFromRecord({
                    entityId,
                    widgetId,
                    dashboardId,
                    isRecord,
                });

                topics.forEach(topic => {
                    eventEmitter.unsubscribe(topic, callback);
                });
            };
        },
        [addEntityToRecord, removeEntityFromRecord],
    );

    const removeEntityListener = useCallback(
        (entityId: ApiKey | ApiKey[], { dashboardId, callback }: ListenerOptions) => {
            const topics = !Array.isArray(entityId)
                ? [genTopic(dashboardId, entityId)]
                : entityId.map(entityId => genTopic(dashboardId, entityId));

            topics.forEach(topic => {
                eventEmitter.unsubscribe(topic, callback);
            });
        },
        [],
    );

    const triggerEntityListener = useCallback(
        (
            entityId: ApiKey | ApiKey[],
            options: { dashboardId: ApiKey; payload?: any; periodTime?: number },
        ) => {
            const entityIds = Array.isArray(entityId) ? entityId : [entityId];
            const timer = entityPool[options.dashboardId]?.timer;

            if (entityIds.length) {
                setEntityPool(options.dashboardId, {
                    entities: entityIds,
                });
            }
            if (timer) return;

            const periodTimer = window.setTimeout(() => {
                const entities = entityPool[options.dashboardId]?.entities;

                entities?.forEach(entityId => {
                    const topic = genTopic(options.dashboardId, entityId);
                    const subscriber = eventEmitter.getSubscriber(topic);

                    if (!subscriber) return;
                    eventEmitter.publish(topic, options.payload, subscriber?.attrs);
                });
                setEntityPool(options.dashboardId, {
                    timer: null,
                    entities: null,
                });
            }, options.periodTime || 0);

            setEntityPool(options.dashboardId, {
                timer: periodTimer,
            });

            return () => {
                const timer = entityPool[options.dashboardId]?.timer;

                if (timer) window.clearTimeout(timer);
                setEntityPool(options.dashboardId, {
                    timer: null,
                    entities: null,
                });
            };
        },
        [],
    );

    const getCurrentEntityIds = useCallback((dashboardId: ApiKey) => {
        const topics = eventEmitter.getTopics();
        const result: string[] = [];

        topics.forEach(topic => {
            const [_dashboardId, _entityId] = topic.split(TOPIC_SEPARATOR);

            if (_dashboardId === dashboardId) result.push(_entityId);
        });

        return result;
    }, []);

    return {
        /**
         * The latest details of the entity that is currently being displayed in dashboard
         */
        entities,

        /**
         * Set latest entity details
         */
        setLatestEntities,

        /**
         * Get latest entity detail by entity id
         */
        getLatestEntityDetail,

        /**
         * Add entity listener
         */
        addEntityListener,

        /**
         * Remove entity listener
         */
        removeEntityListener,

        /**
         * Trigger entity listener to publish entity topic periodically
         */
        triggerEntityListener,

        /**
         * Get entity ids in the current dashboard
         */
        getCurrentEntityIds,
        /**
         * Get entity ids in the record that need to passed to backend
         */
        getRecordEntityIds,
    };
};

export default useActivityEntity;
