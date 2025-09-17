import { isEmpty } from 'lodash-es';
import { type DashboardAPISchema } from '@/services/http';

/**
 * Get default dashboard cover image
 */
export const getDefaultImg = (
    images: DashboardAPISchema['getDashboardPresetCovers']['response'],
) => {
    if (!Array.isArray(images) || isEmpty(images)) {
        return null;
    }

    return images.find(c => c.name === 'Purple')?.data;
};
