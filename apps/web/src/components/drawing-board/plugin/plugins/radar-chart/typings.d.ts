import type { EntityAPISchema } from '@/services/http';

export interface ViewConfigProps {
    title: string;
    entityList: EntityOptionType[];
    time: number;
    metrics: DataAggregateType;
}

export type ConfigureType = any;

export interface AggregateHistoryList {
    entity: EntityOptionType;
    data: EntityAPISchema['getAggregateHistory']['response'];
}
