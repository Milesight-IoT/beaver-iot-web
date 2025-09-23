import { useRequest } from 'ahooks';
import { deviceAPI, isRequestSuccess, getResponseData, awaitWrap } from '@/services/http';

export function useGroupCount() {
    const { run: getDeviceGroupCount, data: groupCount } = useRequest(
        async () => {
            const [error, resp] = await awaitWrap(deviceAPI.getDeviceGroupCount());
            if (error || !isRequestSuccess(resp)) {
                return;
            }

            const data = getResponseData(resp);
            return data?.number || 0;
        },
        { debounceWait: 300 },
    );

    return {
        groupCount,
        getDeviceGroupCount,
    };
}
