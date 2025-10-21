import { useState, useContext, useRef } from 'react';
import { useMemoizedFn, useDebounceFn } from 'ahooks';
import { useNavigate } from 'react-router-dom';

import { toast } from '@milesight/shared/src/components';
import { useI18n } from '@milesight/shared/src/hooks';

import { useUserStore } from '@/stores';
import {
    userAPI,
    dashboardAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
} from '@/services/http';
import { DrawingBoardContext } from '@/components/drawing-board/context';
import useDashboardStore from '@/pages/dashboard/store';

/**
 * Get Device drawing board data
 */
export function useDeviceDrawingBoard(isPreview?: boolean) {
    const { userInfo } = useUserStore();
    const { getIntlText } = useI18n();
    const navigate = useNavigate();
    const context = useContext(DrawingBoardContext);
    const { setPath } = useDashboardStore();

    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const getDeviceDrawingBoard = useMemoizedFn(async (deviceId?: ApiKey) => {
        if (!deviceId || !userInfo?.user_id) {
            return;
        }

        const [error, resp] = await awaitWrap(
            userAPI.getUserHasResourcePermission({
                user_id: userInfo.user_id,
                resource_id: deviceId,
                resource_type: 'DEVICE',
            }),
        );
        if (error || !isRequestSuccess(resp)) {
            return;
        }

        const result = getResponseData(resp);
        const { has_permission: hasPermission } = result || {};
        if (!hasPermission) {
            toast.error(getIntlText('common.label.page_not_permission'));
            return;
        }

        const [error1, resp1] = await awaitWrap(
            dashboardAPI.getDeviceDrawingBoard({
                device_id: deviceId,
            }),
        );
        if (error1 || !isRequestSuccess(resp1)) {
            return;
        }

        const result1 = getResponseData(resp1);
        const { canvas_id: canvasId } = result1 || {};

        return canvasId;
    });

    const { run } = useDebounceFn(
        async (deviceId: ApiKey) => {
            try {
                const canvasId = await getDeviceDrawingBoard(deviceId);
                if (!canvasId) {
                    return;
                }

                setPath({
                    id: canvasId,
                    name: '',
                    attach_id: deviceId,
                    attach_type: 'DEVICE',
                });
                navigate(`/dashboard?id=${canvasId}&deviceId=${deviceId}`);
            } finally {
                if (timeoutRef?.current) clearTimeout(timeoutRef.current);

                timeoutRef.current = setTimeout(() => {
                    setLoading({});
                }, 300);
            }
        },
        {
            wait: 300,
        },
    );
    const handleDeviceDrawingBoard = useMemoizedFn(async (deviceId?: ApiKey) => {
        if (context?.isEdit || !deviceId || isPreview) {
            return;
        }
        setLoading({ [deviceId]: true });

        run?.(deviceId);
    });

    return {
        loading,
        getDeviceDrawingBoard,
        handleDeviceDrawingBoard,
    };
}
