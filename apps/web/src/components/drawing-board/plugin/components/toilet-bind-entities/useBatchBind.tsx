import { useState } from 'react';
import { useMemoizedFn, useDebounceFn } from 'ahooks';
import dayjs from 'dayjs';

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

export type CurrentStatus = 'before' | 'completed';

type ParseRes = DashboardAPISchema['parseToiletBindTemplate']['response'];

export function useBatchBind() {
    const { getIntlText } = useI18n();
    const { formData } = useControlPanelStore(useStoreShallow(['formData']));
    const { buildingInfo } = formData || {};

    const [currentStatus, setCurrentStatus] = useState<CurrentStatus>('before');
    const [parseResult, setParseResult] = useState<{
        key: ApiKey;
        file: File;
        data: ParseRes;
    }>();
    const [downloading, setDownloading] = useState(false);

    const handleSuccessData = useMemoizedFn((successData?: ParseRes['success_data']) => {
        if (!successData?.count) {
            return;
        }

        console.log('handleSuccessData ? ', successData);
    });

    const { run: handleDownloadErrorFile } = useDebounceFn(
        async () => {
            try {
                const { key, file } = parseResult || {};
                const failedData = parseResult?.data?.failed_data;
                if (!failedData?.count || !key || !file) {
                    return;
                }

                const [error, resp] = await awaitWrap(
                    dashboardAPI.generateToiletBindErrorFile(
                        {
                            building_key: key,
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

                linkDownload(data, `${dayjs().format('YYYY_MM_DD_HH_mm_ss')}_error_messages.xlsx`);
                toast.success(getIntlText('common.message.operation_success'));
            } finally {
                setDownloading(false);
            }
        },
        { wait: 300 },
    );

    const handleUploadFile = useMemoizedFn(async (file: FileValueType, callback?: () => void) => {
        const building: ToiletBuildingProps = buildingInfo || {
            key: 'b112',
        };
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
                key: building.key,
                file: file.original,
                data,
            });
            setCurrentStatus('completed');
            return;
        }

        callback?.();
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
