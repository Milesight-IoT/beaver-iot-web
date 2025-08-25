import { useCallback, useEffect, useRef } from 'react';
import GRL, { WidthProvider, type Layout } from 'react-grid-layout';
import { get } from 'lodash-es';

import { WidgetDetail } from '@/services/http/dashboard';
import {
    GRID_LAYOUT_COLS,
    GRID_LAYOUT_MARGIN,
    GRID_ROW_HEIGHT,
} from '@/components/drawing-board/constants';
import { DrawingBoardContext } from '../../context';
import { useBackgroundHelper, useWidgetResize, useWidget } from './hooks';
import Widget from './widget';

import './style.less';

const ReactGridLayout = WidthProvider(GRL);

/**
 * The widget type corresponds to the default height of the too small screen
 */
const DEFAULT_GRID_HEIGHT = {
    data_chart: 3,
    operate: 1,
    data_card: 2,
};
/**
 * Gets the default height of the widget for a screen that is too small
 */
const getSmallScreenH = (data: WidgetDetail['data']) => {
    const DEFAULT_HEIGHT = 3;
    const { class: widgetClass, type: widgetType } = data || {};
    if (!widgetClass || !widgetType) return DEFAULT_HEIGHT;

    if (widgetType === 'iconRemaining') return 1;
    return get(DEFAULT_GRID_HEIGHT, widgetClass, DEFAULT_HEIGHT);
};
interface WidgetProps {
    onChangeWidgets: (widgets: any[]) => void;
    widgets: WidgetDetail[];
    isEdit: boolean;
    onEdit: (data: WidgetDetail) => void;
    mainRef: any;
    isTooSmallScreen: boolean;
    dashboardId: ApiKey;
}

const Widgets = (props: WidgetProps) => {
    const { widgets, onChangeWidgets, isEdit, onEdit, mainRef, isTooSmallScreen, dashboardId } =
        props;

    const { helperBg, showHelperBg, setShowHelperBg } = useBackgroundHelper();
    const { handleGridLayoutResize } = useWidgetResize(mainRef);
    const { newDrawingBoardContext } = useWidget();

    const widgetRef = useRef<WidgetDetail[]>();
    const requestRef = useRef<any>(null);

    useEffect(() => {
        widgetRef.current = widgets;
    }, [widgets]);

    useEffect(() => {
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, []);

    const handleChangeWidgets = (data: Layout[]) => {
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
        requestRef.current = requestAnimationFrame(() => {
            const newData = widgets.map((widget: WidgetDetail) => {
                const findWidget = data.find(
                    (item: any) =>
                        (item.i && item.i === widget.widget_id) ||
                        (item.i && item.i === widget.tempId),
                );
                if (findWidget) {
                    return {
                        ...widget,
                        data: {
                            ...widget.data,
                            pos: findWidget,
                        },
                    };
                }
                return widget;
            });

            onChangeWidgets(newData);
        });
    };

    // Edit component
    const handleEdit = useCallback(
        (data: WidgetDetail) => {
            onEdit(data);
        },
        [onEdit],
    );

    // Remove component
    const handleDelete = useCallback(
        (data: WidgetDetail) => {
            /**
             * The magic here is that widgets always take the old value
             * and use widgetRef.current to ensure the latest value
             */
            let index = widgetRef.current?.findIndex(
                (item: WidgetDetail) =>
                    (item.widget_id && item.widget_id === data.widget_id) ||
                    (item.tempId && item.tempId === data.tempId),
            );
            if (!index && index !== 0) {
                index = -1;
            }
            if (index > -1) {
                const newWidgets = [...(widgetRef.current || [])];
                newWidgets.splice(index, 1);
                onChangeWidgets(newWidgets);
            }
        },
        [onChangeWidgets],
    );

    return (
        <ReactGridLayout
            isDraggable={isEdit}
            isResizable={isEdit}
            rowHeight={GRID_ROW_HEIGHT}
            cols={GRID_LAYOUT_COLS}
            margin={[GRID_LAYOUT_MARGIN, GRID_LAYOUT_MARGIN]}
            onLayoutChange={handleChangeWidgets}
            draggableCancel=".drawing-board__widget-icon-img,.drawing-board__custom-resizable-handle"
            className={`${
                isEdit ? 'drawing-board__widget-grid-edit' : 'drawing-board__widget-grid-not-edit'
            } slow-transition-react-grid-layout`}
            resizeHandle={
                <span className="drawing-board__custom-resizable-handle drawing-board__custom-resizable-handle-se" />
            }
            onDragStart={() => setShowHelperBg(true)}
            onDragStop={() => setShowHelperBg(false)}
            onResizeStart={() => setShowHelperBg(true)}
            onResizeStop={() => setShowHelperBg(false)}
            style={showHelperBg ? helperBg : { minHeight: 'calc(100% + 60px)' }}
            onResize={handleGridLayoutResize}
        >
            {widgets.map((data: WidgetDetail) => {
                const id = (data.widget_id || data.tempId) as ApiKey;

                const pos = {
                    ...data.data.pos,
                    w: isTooSmallScreen ? 12 : data.data?.pos?.w || data.data.minCol || 2,
                    h: isTooSmallScreen
                        ? getSmallScreenH(data?.data)
                        : data.data?.pos?.h || data.data.minRow || 2,
                    minW: data.data.minCol || 2,
                    minH: data.data.minRow || 2,
                    maxW: GRID_LAYOUT_COLS - (data?.data?.pos?.x || 0),
                    maxH: data.data.maxRow,
                    i: data?.widget_id || data.data.tempId,
                    x: data.data.pos?.x || 0,
                    y: data.data.pos?.y || 0,
                };

                return (
                    <div
                        key={id}
                        data-grid={pos}
                        className={!isEdit ? 'drawing-board__widget-grid-edit' : ''}
                    >
                        <DrawingBoardContext.Provider value={newDrawingBoardContext(data)}>
                            <Widget
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                data={data}
                                isEdit={isEdit}
                                key={id}
                                mainRef={mainRef}
                                dashboardId={dashboardId}
                            />
                        </DrawingBoardContext.Provider>
                    </div>
                );
            })}
        </ReactGridLayout>
    );
};

export default Widgets;
