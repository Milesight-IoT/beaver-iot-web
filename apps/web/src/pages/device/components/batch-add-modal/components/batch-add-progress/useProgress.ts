import { useEffect, useState, useRef, useMemo } from 'react';
import { useMemoizedFn } from 'ahooks';
import { isEmpty, cloneDeep, isNil, get } from 'lodash-es';
import dayjs from 'dayjs';

import { useI18n } from '@milesight/shared/src/hooks';
import { linkDownload } from '@milesight/shared/src/utils/tools';
import { toast } from '@milesight/shared/src/components';
import { getApiErrorInfos } from '@milesight/shared/src/utils/parseApiErrorData';

import {
    type AddDeviceProps,
    deviceAPI,
    isRequestSuccess,
    awaitWrap,
    getResponseData,
} from '@/services/http';
import type { BatchAddProgressProps } from './index';

interface DeviceErrorInfoProps {
    id: ApiKey;
    msg: string;
}

export function useProgress(props: BatchAddProgressProps) {
    const { interrupt, addList, onLoopEnd, onCompleted, templateFile, integration, rowIds } =
        props || {};

    const { getIntlText } = useI18n();

    const [successCount, setSuccessCount] = useState<number>(0);
    const [failedCount, setFailedCount] = useState<number>(0);
    const [completedInterrupt, setCompletedInterrupt] = useState(false);
    const [interruptPosition, setInterruptPosition] = useState<number>();
    const [downloading, setDownloading] = useState(false);

    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const successCountRef = useRef<number>(0);
    const failedCountRef = useRef<number>(0);
    const errorInfosRef = useRef<DeviceErrorInfoProps[]>([]);

    const handleWhetherLoopEnd = useMemoizedFn(index => {
        if (!Array.isArray(addList) || isEmpty(addList)) {
            return;
        }

        /** Execute add list loop end callback */
        if (index === addList.length - 1) {
            onLoopEnd?.();
        }
    });

    const handleSuccess = useMemoizedFn(() => {
        successCountRef.current += 1;
        setSuccessCount(successCountRef.current);
    });

    const handleFailed = useMemoizedFn((errorInfo: DeviceErrorInfoProps) => {
        failedCountRef.current += 1;
        setFailedCount(failedCountRef.current);

        errorInfosRef.current.push({
            ...errorInfo,
            id: get(rowIds, errorInfo.id, errorInfo.id),
        });
    });

    const handleInterrupted = useMemoizedFn((lastIndex?: number) => {
        /**
         * Params validate
         */
        if (!Array.isArray(addList) || isEmpty(addList) || isNil(lastIndex)) {
            return;
        }

        /**
         * Add already completed
         */
        if (successCountRef.current + failedCountRef.current === addList.length) {
            return;
        }

        setInterruptPosition(lastIndex + 1);

        Array.from({ length: addList.length - 1 - lastIndex }).forEach((_, index) => {
            handleFailed({
                id: lastIndex + index + 1,
                msg: getIntlText('common.label.tasks_has_been_interrupted'),
            });
        });

        setCompletedInterrupt(true);
        onCompleted?.();
    });

    const handleWhetherAddCompleted = useMemoizedFn((lastIndex?: number) => {
        if (!Array.isArray(addList) || isEmpty(addList)) {
            return;
        }

        if (interrupt.current) {
            handleInterrupted(lastIndex);
            return;
        }

        /** Execute add list completed callback */
        if (successCountRef.current + failedCountRef.current === addList.length) {
            onCompleted?.();
        }
    });

    const handleAddDeviceList = useMemoizedFn(async () => {
        if (!Array.isArray(addList) || isEmpty(addList)) {
            return;
        }

        const MAX_REQUEST = 3;
        let count = 0;
        let requestList: AddDeviceProps[] = [];
        let indexList: number[] = [];

        for (const [index, device] of addList.entries()) {
            handleWhetherLoopEnd(index);

            if (interrupt.current) {
                handleInterrupted(successCountRef.current + failedCountRef.current - 1);
                break;
            }

            count += 1;
            requestList.push(device);
            indexList.push(index);

            if (count < MAX_REQUEST && addList.length - 1 !== index) {
                continue;
            }

            try {
                // eslint-disable-next-line no-await-in-loop
                const responses = await Promise.allSettled(
                    requestList.map(item =>
                        deviceAPI.addDevice(item, {
                            $ignoreError: true,
                        }),
                    ),
                );

                const newIndexList = cloneDeep(indexList);
                if (Array.isArray(responses) && !isEmpty(responses)) {
                    responses.forEach((resp, newIndex) => {
                        if (resp.status === 'fulfilled' && isRequestSuccess(resp?.value)) {
                            handleSuccess();
                        } else if (resp.status === 'fulfilled') {
                            handleFailed({
                                id: newIndexList[newIndex],
                                msg: getApiErrorInfos(resp?.value?.data).join('; \n') || 'unknown',
                            });
                        } else if (resp.status === 'rejected') {
                            handleFailed({
                                id: newIndexList[newIndex],
                                msg:
                                    getApiErrorInfos(resp?.reason?.response?.data).join('; \n') ||
                                    'unknown',
                            });
                        }
                    });

                    handleWhetherAddCompleted(newIndexList.pop());
                }
            } catch {
                // console.error(e);
            } finally {
                count = 0;
                requestList = [];
                indexList = [];
            }
        }
    });

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            handleAddDeviceList();
        }, 150);
    }, [handleAddDeviceList]);

    /**
     * Show the progress string info, eg: 5/500
     */
    const percentageString = useMemo(() => {
        if (!Array.isArray(addList) || isEmpty(addList)) {
            return '/';
        }

        return `${interruptPosition ?? successCount + failedCount}/${addList.length}`;
    }, [interruptPosition, successCount, failedCount, addList]);

    /** Current progress percentage */
    const percentage = useMemo(() => {
        if (!Array.isArray(addList) || isEmpty(addList)) {
            return 0;
        }

        return ((interruptPosition ?? successCount + failedCount) / addList.length) * 100;
    }, [interruptPosition, successCount, failedCount, addList]);

    /** Adding status message */
    const statusMsg = useMemo(() => {
        if (completedInterrupt) {
            return getIntlText('common.label.tasks_has_been_interrupted');
        }

        if (successCount + failedCount === addList?.length) {
            return getIntlText('common.label.all_tasks_completed');
        }

        return getIntlText('common.label.is_adding');
    }, [getIntlText, successCount, failedCount, addList, completedInterrupt]);

    const handleDownloadFailedDevice = useMemoizedFn(async () => {
        try {
            setDownloading(true);

            if (
                !integration ||
                !templateFile ||
                !Array.isArray(errorInfosRef.current) ||
                isEmpty(errorInfosRef.current)
            ) {
                return;
            }

            const [error, resp] = await awaitWrap(
                deviceAPI.generateDeviceAddErrorFile(
                    {
                        integration: String(integration),
                        file: templateFile,
                        errors: JSON.stringify({
                            errors: errorInfosRef.current,
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
            if (!data) return;

            linkDownload(data, `${dayjs().format('YYYY_MM_DD_HH_mm_ss')}_error_messages.xlsx`);
            toast.success(getIntlText('common.message.operation_success'));
        } finally {
            setDownloading(false);
        }
    });

    return {
        successCount,
        failedCount,
        percentageString,
        percentage,
        statusMsg,
        completedInterrupt,
        downloading,
        handleDownloadFailedDevice,
    };
}
