import { useCallback, useEffect, useRef } from 'react';
import GRL, { WidthProvider } from 'react-grid-layout';
import { WidgetDetail } from '@/services/http/dashboard';
import Widget from './widget';

const ReactGridLayout = WidthProvider(GRL);
interface WidgetProps {
    onChangeWidgets: (widgets: any[]) => void;
    widgets: WidgetDetail[];
    isEdit: boolean;
    onEdit: (data: WidgetDetail) => void;
    mainRef: any;
}

const Widgets = (props: WidgetProps) => {
    const { widgets, onChangeWidgets, isEdit, onEdit, mainRef } = props;
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

    const handleChangeWidgets = (data: any[]) => {
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

    // 编辑组件
    const handleEdit = useCallback((data: WidgetDetail) => {
        onEdit(data);
    }, []);

    // 删除组件
    const handleDelete = useCallback(
        (data: WidgetDetail) => {
            // 这里有点神奇，widgets一直取的是旧值，先用widgetRef.current确保最新值
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

    return (
        <ReactGridLayout
            isDraggable={isEdit}
            isResizable={isEdit}
            rowHeight={30}
            cols={24}
            margin={[20, 20]}
            onLayoutChange={handleChangeWidgets}
            draggableCancel=".dashboard-content-widget-icon-img,.dashboard-custom-resizable-handle"
            className={`${isEdit ? 'dashboard-content-widget-grid-edit' : 'dashboard-content-widget-grid-not-edit'}`}
            resizeHandle={
                <span className="dashboard-custom-resizable-handle dashboard-custom-resizable-handle-se" />
            }
        >
            {widgets.map((data: WidgetDetail) => {
                const id = (data.widget_id || data.tempId) as ApiKey;
                const pos = {
                    ...data.data.pos,
                    w: data.data?.pos?.w || data.data.minCol || 3,
                    h: data.data?.pos?.h || data.data.minRow || 2,
                    minW: data.data.minCol || 3,
                    minH: data.data.minRow || 2,
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
