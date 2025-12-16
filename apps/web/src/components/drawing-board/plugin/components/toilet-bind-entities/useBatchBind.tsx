import { useMemoizedFn } from 'ahooks';
import dayjs from 'dayjs';

import {
    CheckCircleIcon,
    CancelIcon,
    FileDownloadOutlinedIcon,
    toast,
} from '@milesight/shared/src/components';
import { useI18n, useStoreShallow } from '@milesight/shared/src/hooks';
import { linkDownload } from '@milesight/shared/src/utils/tools';

import { type FileValueType, useConfirm } from '@/components';
import useControlPanelStore from '@/components/drawing-board/plugin/store';
import {
    DashboardAPISchema,
    dashboardAPI,
    awaitWrap,
    isRequestSuccess,
    getResponseData,
} from '@/services/http';
import { type ToiletBuildingProps } from '../../types';

type ParseRes = DashboardAPISchema['parseToiletBindTemplate']['response'];

export function useBatchBind() {
    const { getIntlText } = useI18n();
    const confirm = useConfirm();
    const { formData } = useControlPanelStore(useStoreShallow(['formData']));
    const { buildingInfo } = formData || {};

    const handleSuccessData = useMemoizedFn((successData?: ParseRes['success_data']) => {
        if (!successData?.count) {
            return;
        }

        console.log('handleSuccessData ? ', successData);
    });

    const handleDownloadErrorFile = useMemoizedFn(
        async (commonParams: { key: ApiKey; file: File }, failedData?: ParseRes['failed_data']) => {
            if (!failedData?.count || !commonParams.key || !commonParams.file) {
                return;
            }

            const [error, resp] = await awaitWrap(
                dashboardAPI.generateToiletBindErrorFile(
                    {
                        building_key: commonParams.key,
                        file: commonParams.file,
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
        },
    );

    const handleFailedData = useMemoizedFn(
        (commonParams: { key: ApiKey; file: File }, data?: ParseRes) => {
            if (!data) {
                return;
            }

            const { success_data: successData, failed_data: failedData } = data || {};

            confirm({
                title: getIntlText('dashboard.title.batch_bind_result'),
                dialogContentTextProps: {
                    component: 'div',
                    sx: {
                        '& .batch-bind-result': {
                            display: 'flex',
                            flexDirection: 'column',
                            fontSize: '14px',
                            lineHeight: '22px',
                            color: 'var(--text-color-primary)',
                            '.success-item': {
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: 1,
                                '.success-count': {
                                    marginLeft: 1,
                                },
                            },
                            '.failed-item': {
                                display: 'flex',
                                alignItems: 'center',
                                '.failed-count': {
                                    display: 'flex',
                                    marginLeft: 1,
                                    '.download-wrapper': {
                                        display: 'flex',
                                        marginLeft: 1,
                                        cursor: 'pointer',
                                        color: 'var(--primary-color-base)',
                                        '.download-text': {
                                            marginLeft: 0.5,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                description: (
                    <div className="batch-bind-result">
                        <div key="success-item" className="success-item">
                            <CheckCircleIcon key="CheckCircleIcon" color="success" />
                            <div key="success-count" className="success-count">
                                {getIntlText('dashboard.tip.batch_bind_entities_success', {
                                    1: successData?.count || 0,
                                })}
                            </div>
                        </div>
                        <div key="failed-item" className="failed-item">
                            <CancelIcon key="CancelIcon" color="error" />
                            <div key="failed-count" className="failed-count">
                                <div key="failed-count-text">
                                    {getIntlText('dashboard.tip.batch_bind_entities_failed', {
                                        1: failedData?.count || 0,
                                    })}
                                </div>
                                <div
                                    key="download-wrapper"
                                    className="download-wrapper"
                                    onClick={() =>
                                        handleDownloadErrorFile(commonParams, failedData)
                                    }
                                >
                                    <FileDownloadOutlinedIcon
                                        key="FileDownloadOutlinedIcon"
                                        color="inherit"
                                    />
                                    <div key="download-text" className="download-text">
                                        {getIntlText('common.button.download')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ),
                confirmButtonText: getIntlText('common.button.confirm'),
                cancelButtonProps: {
                    sx: {
                        display: 'none',
                    },
                },
            });
        },
    );

    const handleUploadFile = useMemoizedFn(async (file: FileValueType, callback?: () => void) => {
        const building: ToiletBuildingProps = buildingInfo || {
            key: 'b112',
        };
        if (!building?.key || !file?.original) {
            return;
        }

        const commonParams = {
            key: building.key,
            file: file.original,
        };
        const [error, resp] = await awaitWrap(
            dashboardAPI.parseToiletBindTemplate({
                building_key: commonParams.key,
                file: commonParams.file,
            }),
        );
        if (error || !isRequestSuccess(resp)) {
            return;
        }

        const data = getResponseData(resp);
        if (data?.failed_data?.count) {
            handleFailedData(commonParams, data);
        }

        handleSuccessData(data?.success_data);
        callback?.();
    });

    return {
        /**
         * Handle batch bind entities upload file
         */
        handleUploadFile,
    };
}
