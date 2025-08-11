import { useRequest } from 'ahooks';
import dayjs from 'dayjs';

import { linkDownload } from '@milesight/shared/src/utils/tools';
import { toast } from '@milesight/shared/src/components';
import { useI18n } from '@milesight/shared/src/hooks';

import { deviceAPI, getResponseData, awaitWrap, isRequestSuccess } from '@/services/http';

export function useGetTemplate() {
    const { getIntlText } = useI18n();

    const { loading: downloadTemplateLoading, run: getDeviceTemplate } = useRequest(
        async (integrationId: string) => {
            if (!integrationId) return;

            const [error, resp] = await awaitWrap(
                deviceAPI.getDeviceBatchTemplate(
                    {
                        integration: integrationId,
                    },
                    {
                        responseType: 'blob',
                    },
                ),
            );
            if (error || !isRequestSuccess(resp)) {
                return;
            }

            const data = getResponseData(resp);
            if (!data) return;

            linkDownload(
                data,
                `${dayjs().format('YYYY_MM_DD_HH_mm_ss')}_devices_import_template.xlsx`,
            );
            toast.success(getIntlText('common.message.operation_success'));
        },
        {
            manual: true,
        },
    );

    return {
        downloadTemplateLoading,
        getDeviceTemplate,
    };
}
