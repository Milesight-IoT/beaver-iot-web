import { useRequest } from 'ahooks';
import dayjs from 'dayjs';

import { linkDownload } from '@milesight/shared/src/utils/tools';
import { toast } from '@milesight/shared/src/components';
import { useI18n, useStoreShallow } from '@milesight/shared/src/hooks';

import useControlPanelStore from '@/components/drawing-board/plugin/store';
import { dashboardAPI, getResponseData, awaitWrap, isRequestSuccess } from '@/services/http';
import { type ToiletBuildingProps } from '../../types';

export function useGetTemplate() {
    const { getIntlText } = useI18n();
    const { formData } = useControlPanelStore(useStoreShallow(['formData']));

    const { loading: downloadTemplateLoading, run: getTemplate } = useRequest(
        async () => {
            const building: ToiletBuildingProps | undefined = formData?.buildingInfo || {
                key: 'b112',
                name: 'B112',
            };
            if (!building) return;

            const [error, resp] = await awaitWrap(
                dashboardAPI.getToiletBindTemplate(
                    {
                        building_key: building.key,
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
                `${dayjs().format('YYYY_MM_DD_HH_mm_ss')}_${building.name}_entity_import_template.xlsx`,
            );
            toast.success(getIntlText('common.message.operation_success'));
        },
        {
            manual: true,
        },
    );

    return {
        downloadTemplateLoading,
        getTemplate,
    };
}
