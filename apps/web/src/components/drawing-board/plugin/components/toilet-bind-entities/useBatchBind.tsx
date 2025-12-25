import { useState } from 'react';
import { useMemoizedFn, useDebounceFn } from 'ahooks';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash-es';

import { toast } from '@milesight/shared/src/components';
import { useI18n, useStoreShallow } from '@milesight/shared/src/hooks';
import { linkDownload } from '@milesight/shared/src/utils/tools';

import { type FileValueType } from '@/components';
import useControlPanelStore from '@/components/drawing-board/plugin/store';
import {
    DashboardAPISchema,
    dashboardAPI,
    awaitWrap,
    isRequestSuccess,
    getResponseData,
} from '@/services/http';
import { type ToiletBuildingProps } from '../../types';
import { type MarkerExtraInfoProps } from '../../plugins/occupancy-marker/control-panel';

export type CurrentStatus = 'before' | 'completed';

type ParseRes = DashboardAPISchema['parseToiletBindTemplate']['response'];

export function useBatchBind(
    setValue: (v: React.SetStateAction<MarkerExtraInfoProps[]>, ...args: any[]) => void,
) {
    const { getIntlText } = useI18n();
    const { formData } = useControlPanelStore(useStoreShallow(['formData']));
    const { buildingInfo } = formData || {};

    const [currentStatus, setCurrentStatus] = useState<CurrentStatus>('before');
    const [parseResult, setParseResult] = useState<{
        file: File;
        data: ParseRes;
        building: ToiletBuildingProps;
    }>();
    const [downloading, setDownloading] = useState(false);

    const handleSuccessData = useMemoizedFn((successData?: ParseRes['success_data']) => {
        if (!successData?.count) {
            return;
        }

        const successItems: MarkerExtraInfoProps[] = (successData?.items || []).map(s => ({
            toiletId: s.toilet_id,
            toiletNumber: s.toilet_number,
            occupiedState: s.occupied_state,
            deviceStatus: s.device_status,
            notification: s.notification,
            entityKeyToId: s.entity_key_to_id,
        }));
        const successKeys = successItems.map(item => item?.toiletId).filter(Boolean);
        if (!Array.isArray(successKeys) || isEmpty(successKeys)) {
            return;
        }

        setValue(prev => {
            /**
             * Filter out marker extra info items that are not in the success keys
             */
            const oldMarkerExtraInfos = ((prev || []) as MarkerExtraInfoProps[]).filter(
                item => !successKeys.includes(item.toiletId),
            );

            /**
             * Set the updated marker extra info items to the form config
             */
            return [...oldMarkerExtraInfos, ...successItems];
        });
    });

    const { run: handleDownloadErrorFile } = useDebounceFn(
        async () => {
            try {
                const { building, file } = parseResult || {};
                const failedData = parseResult?.data?.failed_data;
                if (!failedData?.count || !building || !file) {
                    return;
                }

                const [error, resp] = await awaitWrap(
                    dashboardAPI.generateToiletBindErrorFile(
                        {
                            building_key: building.key,
                            file,
                            errors: JSON.stringify({
                                errors: (failedData?.items || []).map(item => {
                                    return {
                                        id: item.id,
                                        msgs: (item?.error_data || []).map(e =>
                                            getIntlText(`error.http.${e.error_code}`),
                                        ),
                                    };
                                }),
                            }),
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
                if (!data) {
                    return;
                }

                linkDownload(
                    data,
                    `${dayjs().format('YYYY_MM_DD_HH_mm_ss')}_${building.name}_error_messages.xlsx`,
                );
                toast.success(getIntlText('common.message.operation_success'));
            } finally {
                setDownloading(false);
            }
        },
        { wait: 300 },
    );

    const handleUploadFile = useMemoizedFn(async (file: FileValueType, callback?: () => void) => {
        const building: ToiletBuildingProps | undefined = buildingInfo;
        if (!building?.key || !file?.original) {
            return;
        }

        const [error, resp] = await awaitWrap(
            dashboardAPI.parseToiletBindTemplate({
                building_key: building.key,
                file: file.original,
            }),
        );
        if (error || !isRequestSuccess(resp)) {
            return;
        }

        const data = getResponseData(resp);
        handleSuccessData(data?.success_data);

        if (data?.failed_data?.count) {
            setParseResult({
                building,
                file: file.original,
                data,
            });
            setCurrentStatus('completed');
            return;
        }

        callback?.();
        toast.success(getIntlText('dashboard.tip.all_batch_bind_entities_success'));
    });

    return {
        /**
         * Handle batch bind entities upload file
         */
        handleUploadFile,
        handleDownloadErrorFile,
        parseResult,
        currentStatus,
        setDownloading,
        downloading,
    };
}
