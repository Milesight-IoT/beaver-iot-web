import { useRequest, useMemoizedFn } from 'ahooks';

import {
    dashboardAPI,
    awaitWrap,
    isRequestSuccess,
    getResponseData,
    type DashboardAPISchema,
    type DashboardListProps,
} from '@/services/http';
import useDashboardListStore from '../../../store';

/**
 * Cover default images
 */
export function useCoverImages(dashboard?: DashboardListProps) {
    const { updateCoverImages } = useDashboardListStore();

    const getDashboardImage = useMemoizedFn(
        (
            images: DashboardAPISchema['getDashboardPresetCovers']['response'],
        ): DashboardAPISchema['getDashboardPresetCovers']['response'][number] | undefined => {
            if (!dashboard || !dashboard?.cover_data) {
                return;
            }

            const isDefaultImage = images.some(i => i.data === dashboard.cover_data);
            if (isDefaultImage) {
                return;
            }

            return {
                name: dashboard.name,
                type: 'RESOURCE',
                data: dashboard.cover_data,
            };
        },
    );

    const { loading: imagesLoading } = useRequest(async () => {
        const [error, resp] = await awaitWrap(dashboardAPI.getDashboardPresetCovers());
        if (error || !isRequestSuccess(resp)) {
            return;
        }

        const images = getResponseData(resp) || [];
        const dashboardImage = getDashboardImage(images);

        updateCoverImages(dashboardImage ? [dashboardImage, ...images] : images);

        return images;
    });

    return {
        imagesLoading,
    };
}
