import { Suspense, useCallback, useRef, useMemo } from 'react';
import classnames from 'classnames';
import {
    DeleteOutlineIcon as DeleteOutline,
    EditOutlinedIcon as EditOutlined,
} from '@milesight/shared/src/components';
import { useTheme } from '@milesight/shared/src/hooks';
import { WidgetDetail } from '@/services/http/dashboard';
import plugins from '../../plugin/plugins';
import { RenderView } from '../../plugin/render';
import type { BoardPluginProps } from '../../plugin/types';

interface WidgetProps {
    data: WidgetDetail;
    isEdit: boolean;
    onEdit: (data: WidgetDetail) => void;
    onDelete: (data: WidgetDetail) => void;
    mainRef: any;
    dashboardId: ApiKey;
}

const Widget = (props: WidgetProps) => {
    const { theme } = useTheme();
    const { data, isEdit, dashboardId, onEdit, onDelete, mainRef } = props;
    const ComponentView = (plugins as any)[`${data.data.type}View`];
    const widgetRef = useRef<HTMLDivElement>(null);

    const handleEdit = useCallback(() => {
        onEdit(data);
    }, [data, onEdit]);

    const handleDelete = useCallback(() => {
        onDelete(data);
    }, [data, onDelete]);

    const widgetCls = useMemo(() => {
        return classnames('drawing-board__widget', {
            'drawing-board__widget-editing': isEdit,
            'none-user-select': isEdit,
        });
    }, [isEdit]);

    return (
        <div className={widgetCls}>
            {isEdit && (
                <div
                    className={classnames('drawing-board__widget-icon', {
                        'drawing-board__widget-icon-edit': isEdit,
                        [`drawing-board__widget-icon-${theme}`]: true,
                    })}
                >
                    <span className="drawing-board__widget-icon-img" onClick={handleEdit}>
                        <EditOutlined />
                    </span>
                    <span className="drawing-board__widget-icon-img" onClick={handleDelete}>
                        <DeleteOutline />
                    </span>
                </div>
            )}
            {ComponentView ? (
                <div ref={widgetRef} className="drawing-board__widget-main">
                    <Suspense>
                        <ComponentView
                            dashboardId={dashboardId}
                            widgetId={data.widget_id || data.tempId || ''}
                            config={data.data.config}
                            configJson={data.data}
                            isEdit={isEdit}
                            mainRef={mainRef}
                        />
                    </Suspense>
                    {isEdit && (
                        <span
                            className="drawing-board__custom-resizable-handle drawing-board__custom-resizable-handle-se"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        />
                    )}
                </div>
            ) : (
                <div ref={widgetRef} className="drawing-board__widget-main">
                    <RenderView
                        configJson={data.data as BoardPluginProps}
                        config={data.data.config}
                    />
                    {isEdit && (
                        <span
                            className="drawing-board__custom-resizable-handle drawing-board__custom-resizable-handle-se"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default Widget;
