import { apiOrigin } from '@milesight/shared/src/config';
import { genApiUrl } from '@milesight/shared/src/utils/tools';
import { API_PREFIX } from '@/services/http';

/**
 * Generate image URL
 */
export const genImageUrl = (path: string) => {
    if (/^https?:\/\//.test(path)) {
        return path;
    }

    return genApiUrl(genApiUrl(apiOrigin, API_PREFIX), path);
};
