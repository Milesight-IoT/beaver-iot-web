import { useEffect, useState } from 'react';
import { useI18n } from '@milesight/shared/src/hooks';
import ConfigPlugin from '@/plugin/config-plugin';
import { WidgetDetail } from '@/services/http/dashboard';

interface WidgetProps {
    plugin: WidgetDetail;
    widgets: WidgetDetail[];
    onCancel: () => void;
    onOk: (data: any) => void;
    parentRef: any;
}

export default (props: WidgetProps) => {
    const { getIntlText } = useI18n();
    const { plugin, widgets, onCancel, onOk, parentRef } = props;
    const [config, setConfig] = useState<any>();

    useEffect(() => {
        setConfig(plugin);
    }, [plugin]);

    const handleClose = () => {
        setConfig(undefined);
        onCancel();
    };

    const handleChange = (data: any) => {
        setConfig({
            ...config,
            data: {
                ...(config?.data || {}),
                config: { ...data },
            },
        });
    };

    // Overlap judgment
    const isOverlapping = (newBox: WidgetDetail) => {
        let isOver = false;
        widgets.forEach((widget: WidgetDetail) => {
            // If it already overlaps or is itself, return directly
            if (isOver) {
                return true;
            }
            const unitHeight = (parentRef?.current?.clientHeight || 0) / 24;
            const unitWidth = (parentRef?.current?.clientWidth || 0) / 24;
            // Determines whether the location of the currently moved component is in the traversed component location
            const right = (widget.data.pos?.left || 0) + (widget.data.pos?.width || 0) * unitWidth;
            const bottom =
                (widget.data.pos?.top || 0) + (widget.data.pos?.height || 0) * unitHeight;
            const left = widget.data.pos?.left || 0;
            const top = widget.data.pos?.top || 0;
            const newLeft = newBox.data.pos?.left || 0;
            const newTop = newBox.data.pos?.top || 0;
            const newRight =
                (newBox.data.pos?.left || 0) + (newBox.data.pos?.width || 0) * unitWidth;
            const newBottom =
                (newBox.data.pos?.top || 0) + (newBox.data.pos?.height || 0) * unitHeight;
            if (!(newRight < left || newLeft > right || newBottom < top || newTop > bottom)) {
                isOver = true;
            }
        });
        return isOver;
    };

    // Calculate the initial position of the new component
    const getInitPos = (data: WidgetDetail) => {
        if (!widgets?.length) return { left: 0, top: 0 };
        const unitHeight = (parentRef?.current?.clientHeight || 0) / 24;
        const unitWidth = (parentRef?.current?.clientWidth || 0) / 24;
        const findPosition = (width: number, height: number): any => {
            for (
                let top = 0;
                top < (parentRef?.current?.clientHeight || 0) - height * unitHeight;
                top += unitHeight
            ) {
                for (
                    let left = 0;
                    left < (parentRef?.current?.clientWidth || 0) - width * unitWidth;
                    left += unitWidth
                ) {
                    const newData = {
                        ...data,
                        data: {
                            ...data.data,
                            pos: {
                                ...data.data.pos,
                                left,
                                top,
                            },
                        },
                    };
                    if (!isOverlapping(newData)) {
                        return { top, left };
                    }
                }
            }
            return {}; // No position found
        };
        const pos: any = findPosition(data.data.pos?.width || 0, data.data.pos?.height || 0);
        return pos;
    };

    const handleOk = (data: any) => {
        const now = String(new Date().getTime());
        // Calculate the maximum Y-axis position and place the new component in that position
        const y = Math.max(
            ...widgets.map(item => (item?.data?.pos.y || 0) + (item?.data?.pos?.h || 0)),
            0,
        );
        const widgetData = {
            widget_id: config?.widget_id,
            tempId: config.tempId || now,
            data: {
                ...config.data,
                config: data,
                pos: {
                    w: config.data.defaultCol,
                    h: config.data.defaultRow,
                    minW: config.data.minCol,
                    minH: config.data.minRow,
                    // maxW: config.data.maxCol,
                    // maxH: config.data.maxRow,
                    y,
                    ...config.data.pos,
                    i: plugin?.widget_id || config.tempId || now,
                },
            },
        };
        // const { left, top } = getInitPos(widgetData);
        // handleClose();
        // if (!left && !top && left !== 0 && top !== 0) {
        //     toast.error(' widget cannot be placed in the current location, please adjust it before adding it ');
        //     return;
        // }
        // TODO: Save the plug-in configuration
        onOk(widgetData);
        handleClose();
    };

    return config ? (
        <ConfigPlugin
            onClose={handleClose}
            onOk={handleOk}
            config={config?.data}
            onChange={handleChange}
            title={
                config.widget_id || config.tempId
                    ? getIntlText('common.label.edit_title', { 1: config?.data?.type })
                    : getIntlText('common.plugin_add_title', { 1: config?.data?.type })
            }
        />
    ) : null;
};
