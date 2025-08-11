import { useMemo } from 'react';
import { useRequest } from 'ahooks';

import { objectToCamelCase } from '@milesight/shared/src/utils/tools';

import { integrationAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';

/**
 * Get integrations data
 */
export default function useGetIntegrations() {
    const { data: integrationList, loading: loadingIntegrations } = useRequest(
        async () => {
            const [error, resp] = await awaitWrap(integrationAPI.getList({ device_addable: true }));
            const respData = getResponseData(resp);

            if (error || !respData || !isRequestSuccess(resp)) return;
            return objectToCamelCase(respData);
        },
        { debounceWait: 300 },
    );

    /**
     * The first integration
     */
    const firstIntegrationId = useMemo(() => {
        return integrationList?.[0]?.id;
    }, [integrationList]);

    return {
        /**
         * integrations data list
         */
        integrationList,
        /**
         * The first integration
         */
        firstIntegrationId,
        loadingIntegrations,
    };
}
