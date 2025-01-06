import { useEffect, useState, useRef, useCallback, useMemo } from 'react';

import { useTime } from '@milesight/shared/src/hooks';
import { entityAPI, isRequestSuccess, getResponseData } from '@/services/http';
import ws, { getExChangeTopic } from '@/services/ws';

export interface UseBasicChartEntityProps {
    entity?: EntityOptionType[];
    time: number;
    isPreview?: boolean;
}

/** Types of the data required for the chart */
export interface ChartShowDataProps {
    entityLabel: string;
    entityValues: (string | number | null)[];
}

/**
 * Basic chart data uniform processing logic hooks
 * Currently used in (column diagram, horizontal column diagram, folding drawing, area diagram)
 */
export function useBasicChartEntity(props: UseBasicChartEntityProps) {
    const { entity, time, isPreview } = props;

    const { getTimeFormat } = useTime();

    /**
     * Canvas ref
     */
    const chartRef = useRef<HTMLCanvasElement>(null);

    /**
     * The data required for the chart
     */
    const [chartShowData, setChartShowData] = useState<ChartShowDataProps[]>([]);
    /**
     * Chart x -axis label
     */
    const [chartLabels, setChartLabels] = useState<number[]>([]);
    /**
     * webSocket subscription theme
     */
    const topics = useMemo(() => {
        if (!entity) return;

        const topicList: string[] = [];
        entity.forEach(e => {
            if (e?.rawData?.entityKey) {
                topicList.push(getExChangeTopic(e.rawData?.entityKey));
            }
        });

        return topicList;
    }, [entity]);

    /**
     * Request chart data
     */
    const requestChartData = useCallback(() => {
        /**
         * Initialization data
         */
        setChartShowData([]);
        setChartLabels([]);

        if (!Array.isArray(entity)) return;

        /**
         * Request to obtain physical historical data
         */
        Promise.all(
            (entity || []).map(e =>
                entityAPI.getHistory({
                    entity_id: e.value,
                    start_timestamp: Date.now() - time,
                    end_timestamp: Date.now(), // 当前时间
                    page_number: 1,
                    page_size: 999,
                }),
            ),
        ).then(result => {
            /**
             * Determine whether there is a data that fails to fail
             */
            const isFailed = (result || []).some(res => !isRequestSuccess(res));
            if (isFailed) return;

            const historyData = (result || [])
                .map(res => getResponseData(res))
                .filter(Boolean)
                .map(d => d?.content || []);

            /**
             * Re -treatment, get all the time periods of all values
             */
            const newChartLabels = historyData
                .reduce((a: number[], c) => {
                    const times = (c || [])?.map(h => h.timestamp)?.filter(Boolean) || [];

                    return [...new Set([...a, ...times])];
                }, [])
                .sort((a, b) => Number(a) - Number(b));
            setChartLabels(newChartLabels);

            const newChartShowData: ChartShowDataProps[] = [];

            /**
             * Physical data conversion
             */
            (historyData || []).forEach((h, index) => {
                const entityLabel = (entity || [])[index]?.label || '';

                /**
                 * Determine whether the current entity has data in this time period according to the timestamp
                 */
                const chartData = newChartLabels.map(l => {
                    const valueIndex = h.findIndex(item => item.timestamp === l);
                    if (valueIndex !== -1) {
                        return h[valueIndex].value;
                    }

                    return null;
                });

                if (entityLabel) {
                    newChartShowData.push({
                        entityLabel,
                        entityValues: chartData,
                    });
                }
            });

            setChartShowData(newChartShowData);
        });
    }, [entity, time]);

    /**
     * Get data
     */
    useEffect(() => {
        requestChartData();
    }, [entity, time, requestChartData]);

    /**
     * Websocket subscription
     */
    useEffect(() => {
        /**
         * Do not subscribe in preview status
         */
        if (!topics || !topics.length || Boolean(isPreview)) return;

        return ws.subscribe(topics, requestChartData);
    }, [topics, requestChartData, isPreview]);

    // Calculate interval time
    const timeUnit: any = useMemo(() => {
        // Show less than one day according to hours
        if (time <= 1440 * 60 * 1000) return 'hour';
        // It is displayed as greater than one month according to the scales of the week
        if (time > 1440 * 60 * 1000 * 30) return 'week';
        return 'day';
    }, [time, chartShowData]);

    const format = useMemo(() => {
        if (timeUnit !== 'hour') {
            return 'yyyy-MM-dd';
        }
        return 'MM-dd HH:mm';
    }, [timeUnit]);

    const displayFormats = useMemo(() => {
        return {
            minute: 'HH:mm',
            hour: 'HH:mm',
            day: format,
            week: format,
        };
    }, [format]);

    // X -axis scale range
    const xAxisRange = useMemo(() => {
        // The current time is used as the final scale, and the time time is pushed forward as the start scale
        return [Date.now() - time, Date.now()];
    }, [time]);

    return {
        /**
         * Canvas ref
         */
        chartRef,
        /**
         * The data required for the chart
         */
        chartLabels: chartLabels.map(l => getTimeFormat(Number(l))),
        /**
         * The data required for the chart
         */
        chartShowData,
        /**
         * Time unit
         */
        timeUnit,
        /**
         * Time format
         */
        format,
        /**
         * Format settings displayed in the timeline
         */
        displayFormats,
        /**
         * X -axis scale range
         */
        xAxisRange,
    };
}
