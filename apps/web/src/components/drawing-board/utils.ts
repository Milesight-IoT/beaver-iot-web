import { omit, isEmpty } from 'lodash-es';

import type { WidgetDetail } from '@/services/http/dashboard';

/**
 * Filter widget data that does not need to be submitted to the back end.
 */
export const filterWidgets = (widgets: WidgetDetail[]): WidgetDetail[] => {
    if (!Array.isArray(widgets) || isEmpty(widgets)) {
        return [];
    }

    return widgets.map(widget => {
        const { data, ...restWidget } = widget;

        return {
            ...restWidget,
            data: omit(data, [
                'originalControlPanel',
                'icon',
                'iconSrc',
                'isPreview',
                'configProps',
                'view',
            ]),
        };
    });
};
