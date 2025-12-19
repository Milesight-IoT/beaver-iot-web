/**
 * Toilet occupancy plugin constants
 */

export const BUILDING_ALL = 'all';

export const ENTITY_TYPE = {
    men: 'men',
    women: 'women',
    disability: 'disability',
};

export type EntityType =
    | typeof ENTITY_TYPE.men
    | typeof ENTITY_TYPE.women
    | typeof ENTITY_TYPE.disability;

export const CHART_DATA_NAME = {
    unboundEntity: 'unboundEntity',
    nonData: 'nonData',
    occupied: 'occupied',
    unoccupied: 'unoccupied',
};

/**
 * Data names that should not trigger animation (loading states)
 */
export const UNANIMATION_DATA_NAMES = [
    CHART_DATA_NAME.unboundEntity,
    CHART_DATA_NAME.nonData,
] as const;
