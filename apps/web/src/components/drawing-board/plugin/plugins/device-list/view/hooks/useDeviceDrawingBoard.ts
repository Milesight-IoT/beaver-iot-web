import { useState, useContext } from 'react';
import { useMemoizedFn } from 'ahooks';
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

/**
 * Get Device drawing board data
 */
export function useDeviceDrawingBoard(isPreview?: boolean) {
    const { userInfo } = useUserStore();
    const { getIntlText } = useI18n();
    const navigate = useNavigate();
    const context = useContext(DrawingBoardContext);

    const [loading, setLoading] = useState<Record<string, boolean>>({});

    const getDeviceDrawingBoard = useMemoizedFn(async (deviceId?: ApiKey) => {
        try {
            if (!deviceId || !userInfo?.user_id) {
                return;
            }

            setLoading({ [deviceId]: true });

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
        } finally {
            setLoading({});
        }
    });

    const handleDeviceDrawingBoard = useMemoizedFn(async (deviceId?: ApiKey) => {
        if (context?.isEdit || !deviceId || isPreview) {
            return;
        }

        const canvasId = await getDeviceDrawingBoard(deviceId);
        if (!canvasId) {
            return;
        }

        navigate(`/dashboard?id=${canvasId}&deviceId=${deviceId}`);
    });

    return {
        loading,
        getDeviceDrawingBoard,
        handleDeviceDrawingBoard,
    };
}
