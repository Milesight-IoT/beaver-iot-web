import { useEffect, useMemo, useRef, useState } from 'react';
import { useMemoizedFn } from 'ahooks';
import { cloneDeep } from 'lodash-es';

import { useTheme, useMediaQuery } from '@milesight/shared/src/hooks';

import { WidgetDetail } from '@/services/http/dashboard';
import useLoadPlugins from './useLoadPlugins';
import useDrawingBoardStore from '../store';

import type { DrawingBoardProps, DrawingBoardExpose } from '../interface';
import type { DrawingBoardContextProps } from '../context';

export default function useDrawingBoardData(props: DrawingBoardProps) {
    const { drawingBoardDetail, operatingPlugin, updateOperatingPlugin, changeIsEdit } = props;

    useLoadPlugins();
    const { pluginsControlPanel } = useDrawingBoardStore();
    const { breakpoints } = useTheme();
    const isTooSmallScreen = useMediaQuery(breakpoints.down('xl'));

    const [loadingWidgets, setLoadingWidgets] = useState(true);
    const [widgets, setWidgets] = useState<WidgetDetail[]>([]);
    const widgetsRef = useRef<WidgetDetail[]>([]);

    useEffect(() => {
        /**
         * Merge the data in the database with the local one to ensure
         * that the component configuration is locally up to date
         */
        const newWidgets = drawingBoardDetail.widgets?.map((item: WidgetDetail) => {
            const sourceJson = pluginsControlPanel.find(plugin => item.data.type === plugin.type);
            if (sourceJson) {
                return {
                    ...item,
                    data: {
                        ...item.data,
                        ...sourceJson,
                    },
                };
            }
            return item;
        });

        setWidgets([...(newWidgets || [])]);
        setLoadingWidgets(false);
        widgetsRef.current = cloneDeep(newWidgets || []);
    }, [drawingBoardDetail.widgets, pluginsControlPanel]);

    useEffect(() => {
        if (isTooSmallScreen) {
            changeIsEdit?.(false);

            /** Restore to the unedited data */
            const newWidgets = cloneDeep(widgetsRef.current);
            setWidgets(newWidgets);
        }
    }, [isTooSmallScreen, changeIsEdit]);

    const handleSelectPlugin = useMemoizedFn((plugin: WidgetDetail) => {
        updateOperatingPlugin(plugin);
    });

    const handleCloseModel = useMemoizedFn(() => {
        updateOperatingPlugin(undefined);
    });

    const updateWidgets = (data: WidgetDetail[]) => {
        setWidgets(data);
    };

    const handleWidgetChange = (data: WidgetDetail) => {
        const newWidgets = [...(widgets || [])];
        const index = newWidgets.findIndex(
            (item: WidgetDetail) =>
                (item.widget_id && item.widget_id === data.widget_id) ||
                (item.tempId && item.tempId === data.tempId),
        );
        if (index > -1) {
            newWidgets[index] = data;
        } else {
            newWidgets.push(data);
        }

        updateWidgets(newWidgets);
    };

    const drawingBoardContext: DrawingBoardContextProps = useMemo(() => {
        return {
            ...props,
            widget: operatingPlugin,
        };
    }, [props, operatingPlugin]);

    const handleCancel = useMemoizedFn(() => {
        const newWidgets = cloneDeep(widgetsRef.current);
        setWidgets(newWidgets);
    });

    const handleSave: DrawingBoardExpose['handleSave'] = useMemoizedFn(() => {
        return {
            ...drawingBoardDetail,
            widgets,
        };
    });

    return {
        /** Check if the screen is too small than 1200px */
        isTooSmallScreen,
        widgets,
        loadingWidgets,
        /**
         * Drawing board context
         */
        drawingBoardContext,
        /**
         * Single widget changes
         */
        handleWidgetChange,
        /**
         * Update all widgets
         */
        updateWidgets,
        handleSelectPlugin,
        handleCloseModel,
        /**
         * Save current newest drawing board data
         */
        handleSave,
        /**
         * Exit dashboard editing status
         */
        handleCancel,
    };
}
