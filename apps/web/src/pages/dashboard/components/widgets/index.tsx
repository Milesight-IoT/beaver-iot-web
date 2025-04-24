import { useCallback, useEffect, useRef, useState } from 'react';
import GRL, { WidthProvider, type Layout } from 'react-grid-layout';
import { useMemoizedFn } from 'ahooks';
import { get } from 'lodash-es';

import { useTheme } from '@milesight/shared/src/hooks';
import { hexToRgba } from '@milesight/shared/src/utils/tools';

import { WidgetDetail } from '@/services/http/dashboard';
import Widget from './widget';

import './style.less';

const ReactGridLayout = WidthProvider(GRL);

const GRID_LAYOUT_MARGIN = 12;
const GRID_LAYOUT_COLS = 12;
const GRID_ROW_HEIGHT = 88;
const HELPER_RECT_HEIGHT = GRID_LAYOUT_MARGIN + GRID_ROW_HEIGHT;

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
}

const Widgets = (props: WidgetProps) => {
    const { getCSSVariableValue } = useTheme();

    const { widgets, onChangeWidgets, isEdit, onEdit, mainRef, isTooSmallScreen } = props;
    const widgetRef = useRef<WidgetDetail[]>();
    const requestRef = useRef<any>(null);
    const bgImageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [showHelperBg, setShowHelperBg] = useState(false);
    const [helperBg, setHelperBg] = useState<React.CSSProperties>();

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
    const handleEdit = useCallback((data: WidgetDetail) => {
        onEdit(data);
    }, []);

    // Remove component
    const handleDelete = useCallback(
        (data: WidgetDetail) => {
            // The magic here is that widgets always take the old value and use widgetRef.current to ensure the latest value
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
        [widgets],
    );

    useEffect(() => {
        /**
         * dynamically set dashboard background helper image
         */
        const setBgImage = () => {
            if (bgImageTimeoutRef.current) {
                clearTimeout(bgImageTimeoutRef.current);
                bgImageTimeoutRef.current = null;
            }

            bgImageTimeoutRef.current = setTimeout(() => {
                const layoutNode = document.querySelector(
                    '.dashboard-content-main .slow-transition-react-grid-layout',
                );
                if (!layoutNode) {
                    return;
                }

                const layoutRect = layoutNode.getBoundingClientRect();
                const { width } = layoutRect || {};
                if (!width) {
                    return;
                }

                const gridWidth = (width - GRID_LAYOUT_MARGIN) / GRID_LAYOUT_COLS;
                if (!gridWidth) {
                    return;
                }

                /**
                 * if the canvas is existed then we need to remove it
                 */
                const isExisted = document.getElementById('grid-layout-canvas');
                if (isExisted) {
                    document.body.removeChild(isExisted);
                }

                const canvas = document.createElement('canvas');
                canvas.id = 'grid-layout-canvas';
                canvas.width = gridWidth;
                canvas.height = HELPER_RECT_HEIGHT;
                canvas.style.display = 'none';
                document.body.appendChild(canvas);
                if (!canvas?.getContext) {
                    return;
                }
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return;
                }

                ctx.beginPath();
                ctx.setLineDash([8, 8]);
                const borderColor = hexToRgba(getCSSVariableValue('--gray-10'), 0.12);
                ctx.strokeStyle = borderColor || '#C9CDD4';
                ctx.lineWidth = 1;
                ctx.strokeRect(1, 1, gridWidth - GRID_LAYOUT_MARGIN - 2, GRID_ROW_HEIGHT - 2);
                ctx.closePath();

                const imageData = canvas.toDataURL();
                setHelperBg({
                    minHeight: 'calc(100% + 60px)',
                    backgroundImage: `url(${imageData})`,
                    backgroundPosition: `${GRID_LAYOUT_MARGIN}px ${GRID_LAYOUT_MARGIN}px`,
                    backgroundSize: `${gridWidth}px ${HELPER_RECT_HEIGHT}px`,
                });

                // clear the canvas
                document.body.removeChild(canvas);
            }, 150);
        };
        window.addEventListener('resize', setBgImage);

        /**
         * initialize
         */
        setBgImage();

        return () => {
            window.removeEventListener('resize', setBgImage);

            if (bgImageTimeoutRef.current) {
                clearTimeout(bgImageTimeoutRef.current);
                bgImageTimeoutRef.current = null;
            }
        };
    }, []);

    const handleGridLayoutResize = useMemoizedFn((...args) => {
        /**
         * Get position scroll the scrollbar to the bottom
         */
        const newTop = mainRef.current?.scrollHeight;
        /**
         * Get the position of the bottom of the dashboard grid layout
         */
        const { bottom } = mainRef.current?.getBoundingClientRect() || {};
        /** Get the current position of the mouse in the screen */
        const mouseY = args?.[4]?.y;
        if (Number.isNaN(bottom) || Number.isNaN(mouseY) || Number.isNaN(newTop)) return;

        /**
         * Unless the mouse position is outside the layout container
         * or returns directly
         */
        if (mouseY < bottom) return;

        /**
         * scroll the scrollbar to the bottom
         */
        mainRef.current?.scrollBy({
            top: mainRef.current?.scrollHeight,
            left: 0,
        });
    });

    return (
        <ReactGridLayout
            isDraggable={isEdit}
            isResizable={isEdit}
            rowHeight={GRID_ROW_HEIGHT}
            cols={GRID_LAYOUT_COLS}
            margin={[GRID_LAYOUT_MARGIN, GRID_LAYOUT_MARGIN]}
            onLayoutChange={handleChangeWidgets}
            draggableCancel=".dashboard-content-widget-icon-img,.dashboard-custom-resizable-handle"
            className={`${
                isEdit
                    ? 'dashboard-content-widget-grid-edit'
                    : 'dashboard-content-widget-grid-not-edit'
            } slow-transition-react-grid-layout`}
            resizeHandle={
                <span className="dashboard-custom-resizable-handle dashboard-custom-resizable-handle-se" />
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
                        className={!isEdit ? 'dashboard-widget-grid-edit' : ''}
                    >
                        <Widget
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            data={data}
                            isEdit={isEdit}
                            key={id}
                            mainRef={mainRef}
                        />
                    </div>
                );
            })}
        </ReactGridLayout>
    );
};

export default Widgets;
