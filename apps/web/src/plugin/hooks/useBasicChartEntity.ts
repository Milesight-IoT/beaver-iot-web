import { useEffect, useState, useRef, useCallback, useMemo } from 'react';

import { useTime } from '@milesight/shared/src/hooks';
import { entityAPI, isRequestSuccess, getResponseData } from '@/services/http';
import ws, { getExChangeTopic } from '@/services/ws';

export interface UseBasicChartEntityProps {
    entity?: EntityOptionType[];
    time: number;
    isPreview?: boolean;
}

/** 图表所需展示的数据的类型 */
export interface ChartShowDataProps {
    entityLabel: string;
    entityValues: (string | number | null)[];
}

/**
 * 基础图表数据统一处理逻辑 hooks
 * 目前使用于（柱状图、横向柱状图、折线图、面积图）
 */
export function useBasicChartEntity(props: UseBasicChartEntityProps) {
    const { entity, time, isPreview } = props;

    const { getTimeFormat } = useTime();

    /**
     * canvas ref
     */
    const chartRef = useRef<HTMLCanvasElement>(null);

    /**
     * 图表所需展示的数据
     */
    const [chartShowData, setChartShowData] = useState<ChartShowDataProps[]>([]);
    /**
     * 图表 X 轴 label
     */
    const [chartLabels, setChartLabels] = useState<number[]>([]);
    /**
     * websocket 订阅主题
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
     * 请求图表数据
     */
    const requestChartData = useCallback(() => {
        /**
         * 初始化数据
         */
        setChartShowData([]);
        setChartLabels([]);

        if (!Array.isArray(entity)) return;

        /**
         * 请求获取实体历史数据
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
             * 判断是否有请求失败的数据
             */
            const isFailed = (result || []).some(res => !isRequestSuccess(res));
            if (isFailed) return;

            const historyData = (result || [])
                .map(res => getResponseData(res))
                .filter(Boolean)
                .map(d => d?.content || []);

            /**
             * 去重处理，获取所有值的时间段
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
             * 实体数据转换
             */
            (historyData || []).forEach((h, index) => {
                const entityLabel = (entity || [])[index]?.label || '';

                /**
                 * 根据时间戳判断当前实体在该时间段是否有数据
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
     * 获取数据
     */
    useEffect(() => {
        requestChartData();
    }, [entity, time, requestChartData]);

    /**
     * websocket 订阅
     */
    useEffect(() => {
        /**
         * 预览状态下不进行订阅
         */
        if (!topics || !topics.length || Boolean(isPreview)) return;

        return ws.subscribe(topics, requestChartData);
    }, [topics, requestChartData, isPreview]);

    // 计算间隔时间
    const timeUnit: any = useMemo(() => {
        // 小于一天按照小时刻度显示
        if (time <= 1440 * 60 * 1000) return 'hour';
        // 大于一个月按照周刻度显示
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

    // x轴刻度范围
    const xAxisRange = useMemo(() => {
        // 当前时间作为最后的刻度，往前推time时间作为开始刻度
        return [Date.now() - time, Date.now()];
    }, [time]);

    return {
        /**
         * canvas ref
         */
        chartRef,
        /**
         * 图表所需展示的数据
         */
        chartLabels: chartLabels.map(l => getTimeFormat(Number(l))),
        /**
         * 图表所需展示的数据
         */
        chartShowData,
        /**
         * 时间单位
         */
        timeUnit,
        /**
         * 时间格式
         */
        format,
        /**
         * 显示在时间轴的格式设置
         */
        displayFormats,
        /**
         * x轴刻度范围
         */
        xAxisRange,
    };
}
