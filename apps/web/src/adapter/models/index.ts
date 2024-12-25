import { useModel as useHistoryModel } from './getHistory';
import { useModel as useAggregateModel } from './getAggregateHistory';
import { useModel as useEntityStatusModel } from './getEntityStatus';
import { useModel as useCountAggregateModel } from './getCountAggregate';

export default {
    getHistory: useHistoryModel,
    getAggregateHistory: useAggregateModel,
    getEntityStatus: useEntityStatusModel,
    getCountAggregate: useCountAggregateModel,
};
