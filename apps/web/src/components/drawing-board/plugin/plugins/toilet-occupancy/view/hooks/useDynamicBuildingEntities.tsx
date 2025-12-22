import { useEffect, useState, useMemo } from 'react';
import { useRequest } from 'ahooks';
import { awaitWrap, entityAPI, getResponseData, isRequestSuccess } from '@/services/http';
import { useActivityEntity } from '../../../../hooks';
import type { ViewConfigProps } from '../../typings';
import { BUILDING_ALL, ENTITY_TYPE, type EntityType } from '../constants';

interface IProps {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    // 'all' | 'b102' | 'b103' | ...
    // The selected building value from dropdown
    selectValue: string;
    config: ViewConfigProps;
}

/**
 * Hook for dynamically monitoring building entities based on selectValue
 */
export const useDynamicBuildingEntities = (props: IProps) => {
    const { config, selectValue, widgetId, dashboardId } = props;

    const [entitiesStatus, setEntitiesStatus] = useState<Record<EntityType, any>>({});

    // Extract entity values that are actually used
    const allWomenId = config?.allWomenOccupiedEntity?.value;
    const allMenId = config?.allMenOccupiedEntity?.value;
    const allDisabilityId = config?.allDisabilityOccupiedEntity?.value;
    const buildingStandId = (config as any)?.[`${selectValue}StandOccupiedEntity`]?.value;
    const buildingDisabilityId = (config as any)?.[`${selectValue}DisabilityOccupiedEntity`]?.value;

    // Get entity IDs based on selectValue (memoized to prevent unnecessary re-renders)
    const entityIds = useMemo(() => {
        if (selectValue === BUILDING_ALL) {
            return {
                [ENTITY_TYPE.women]: allWomenId,
                [ENTITY_TYPE.men]: allMenId,
                [ENTITY_TYPE.disability]: allDisabilityId,
            };
        }

        // For building-specific selection (e.g., 'b102', 'b103')
        return {
            [ENTITY_TYPE.women]: buildingStandId,
            [ENTITY_TYPE.men]: undefined, // Most buildings don't have separate men toilet
            [ENTITY_TYPE.disability]: buildingDisabilityId,
        };
    }, [selectValue, allWomenId, allMenId, allDisabilityId, buildingStandId, buildingDisabilityId]);

    // Batch fetch all entities status (used when switching buildings)
    const fetchAllEntitiesStatus = async () => {
        const requests = [
            { id: entityIds[ENTITY_TYPE.women], type: ENTITY_TYPE.women },
            { id: entityIds[ENTITY_TYPE.men], type: ENTITY_TYPE.men },
            { id: entityIds[ENTITY_TYPE.disability], type: ENTITY_TYPE.disability },
        ];
        const results = await Promise.all(
            requests.map(async ({ id, type }) => {
                // No entity bound
                if (!id) {
                    return { type, data: null };
                }
                const [error, resp] = await awaitWrap(entityAPI.getEntityStatus({ id }));
                // Failed request means no data available
                if (error || !isRequestSuccess(resp)) {
                    return { type, data: {} };
                }
                return { type, data: getResponseData(resp) };
            }),
        );
        // Update all statuses at once (single setState)
        const newStatus = {} as Record<EntityType, any>;
        results.forEach(({ type, data }) => {
            newStatus[type] = data;
        });
        setEntitiesStatus(newStatus);
    };

    // Single entity fetch helper (used by entity listeners)
    const fetchEntityStatus = async (entityId: string | number | undefined, type: EntityType) => {
        if (!entityId) {
            setEntitiesStatus(prev => ({ ...prev, [type]: null }));
            return;
        }

        const [error, resp] = await awaitWrap(entityAPI.getEntityStatus({ id: entityId }));
        if (error || !isRequestSuccess(resp)) {
            setEntitiesStatus(prev => ({ ...prev, [type]: {} }));
            return;
        }
        setEntitiesStatus(prev => ({
            ...prev,
            [type]: getResponseData(resp),
        }));
    };

    // Batch request hook
    const { run: fetchAllStatus } = useRequest(fetchAllEntitiesStatus, {
        manual: true,
        debounceWait: 300,
    });

    // Request hooks for each entity type
    const { run: fetchWomenStatus } = useRequest(
        async () => fetchEntityStatus(entityIds[ENTITY_TYPE.women], ENTITY_TYPE.women),
        {
            manual: true,
            debounceWait: 300,
        },
    );

    const { run: fetchMenStatus } = useRequest(
        async () => fetchEntityStatus(entityIds[ENTITY_TYPE.men], ENTITY_TYPE.men),
        {
            manual: true,
            debounceWait: 300,
        },
    );

    const { run: fetchDisabilityStatus } = useRequest(
        async () => fetchEntityStatus(entityIds[ENTITY_TYPE.disability], ENTITY_TYPE.disability),
        {
            manual: true,
            debounceWait: 300,
        },
    );

    // Batch fetch all entities when selectValue changes
    useEffect(() => {
        // Clear old data immediately to prevent rendering with stale data
        setEntitiesStatus({
            [ENTITY_TYPE.women]: {},
            [ENTITY_TYPE.men]: {},
            [ENTITY_TYPE.disability]: {},
        });
        fetchAllStatus();
    }, [selectValue, fetchAllStatus, entityIds]);

    // ---------- Entity listeners management ----------
    const { addEntityListener } = useActivityEntity();

    // Listen to Women toilet entity
    useEffect(() => {
        const entityId = entityIds[ENTITY_TYPE.women];
        if (!widgetId || !dashboardId || !entityId) return;

        const removeEventListener = addEntityListener(entityId, {
            widgetId,
            dashboardId,
            callback: fetchWomenStatus,
        });

        return () => {
            removeEventListener();
        };
    }, [entityIds[ENTITY_TYPE.women], widgetId, dashboardId, addEntityListener]);

    // Listen to Men toilet entity
    useEffect(() => {
        const entityId = entityIds[ENTITY_TYPE.men];
        if (!widgetId || !dashboardId || !entityId) return;

        const removeEventListener = addEntityListener(entityId, {
            widgetId,
            dashboardId,
            callback: fetchMenStatus,
        });

        return () => {
            removeEventListener();
        };
    }, [entityIds[ENTITY_TYPE.men], widgetId, dashboardId, addEntityListener]);

    // Listen to Disability toilet entity
    useEffect(() => {
        const entityId = entityIds[ENTITY_TYPE.disability];
        if (!widgetId || !dashboardId || !entityId) return;

        const removeEventListener = addEntityListener(entityId, {
            widgetId,
            dashboardId,
            callback: fetchDisabilityStatus,
        });

        return () => {
            removeEventListener();
        };
    }, [entityIds[ENTITY_TYPE.disability], widgetId, dashboardId, addEntityListener]);

    return {
        entitiesStatus,
    };
};
