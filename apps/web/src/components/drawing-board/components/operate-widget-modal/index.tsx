import { useEffect, useState } from 'react';
import { useI18n } from '@milesight/shared/src/hooks';
import { type Layout } from 'react-grid-layout';

import ConfigPlugin from '@/components/drawing-board/plugin/config-plugin';

import { type WidgetDetail } from '@/services/http/dashboard';
import { type BoardPluginProps } from '../../plugin/types';

interface WidgetProps {
    plugin: WidgetDetail;
    widgets: WidgetDetail[];
    onCancel: () => void;
    handleWidgetChange: (data: WidgetDetail) => void;
}

export default (props: WidgetProps) => {
    const { getIntlText } = useI18n();
    const { plugin, widgets, onCancel, handleWidgetChange } = props;
    const [operatingPlugin, setOperatingPlugin] = useState<WidgetDetail>();

    useEffect(() => {
        setOperatingPlugin(plugin);
    }, [plugin]);

    const handleClose = () => {
        setOperatingPlugin(undefined);
        onCancel();
    };

    const handleChange = (data: any) => {
        setOperatingPlugin({
            ...operatingPlugin,
            data: {
                ...(operatingPlugin?.data || {}),
                config: { ...data },
            },
        });
    };

    const handleOk = (newConfig: AnyDict) => {
        if (!operatingPlugin) return;
        const { widget_id: widgetId, tempId, data } = operatingPlugin || {};

        const now = String(new Date().getTime());

        /**
         * Calculate the maximum Y-axis position and place the new component in that position
         */
        const y = Math.max(
            ...widgets.map(item => (item?.data?.pos.y || 0) + (item?.data?.pos?.h || 0)),
            0,
        );

        const newWidgetData: WidgetDetail = {
            widget_id: widgetId,
            tempId: tempId || now,
            data: {
                ...data,
                config: newConfig,
                pos: {
                    w: data?.defaultCol,
                    h: data?.defaultRow,
                    minW: data?.minCol,
                    minH: data?.minRow,
                    // maxW: config.data.maxCol,
                    // maxH: config.data.maxRow,
                    y,
                    ...data?.pos,
                    i: plugin?.widget_id || tempId || now,
                } as Layout,
            },
        };

        handleWidgetChange(newWidgetData);
        handleClose();
    };

    return operatingPlugin ? (
        <ConfigPlugin
            onClose={handleClose}
            onOk={handleOk}
            operatingPlugin={operatingPlugin?.data as BoardPluginProps}
            onChange={handleChange}
            title={
                operatingPlugin?.widget_id || operatingPlugin?.tempId
                    ? getIntlText('dashboard.title.edit_widget', {
                          1: getIntlText(operatingPlugin?.data?.name),
                      })
                    : getIntlText('dashboard.title.add_widget', {
                          1: getIntlText(operatingPlugin?.data?.name),
                      })
            }
        />
    ) : null;
};
