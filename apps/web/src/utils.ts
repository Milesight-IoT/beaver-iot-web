import { get } from 'lodash-es';

import { apiOrigin } from '@milesight/shared/src/config';
import { genApiUrl } from '@milesight/shared/src/utils/tools';
import { API_PREFIX, type ImportEntityProps } from '@/services/http';

/**
 * Generate image URL
 */
export const genImageUrl = (path: string) => {
    if (/^https?:\/\//.test(path)) {
        return path;
    }

    return genApiUrl(genApiUrl(apiOrigin, API_PREFIX), path);
};

/**
 * Get the display value of the enum mapping to the important entity value attribute.
 *
 * Default value: if it has a unit, take it.
 */
export const getIEntityEnumDisplayVal = (value: any, entity?: ImportEntityProps) => {
    return get(
        entity?.value_attribute?.enum,
        String(value),
        `${value}${entity?.value_attribute?.unit || ''}`,
    );
};
