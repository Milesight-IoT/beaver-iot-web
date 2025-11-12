import { useState, useContext } from 'react';
import { useRequest } from 'ahooks';

import { useI18n } from '@milesight/shared/src/hooks';
import { toast } from '@milesight/shared/src/components';

import { deviceAPI, awaitWrap, isRequestSuccess } from '@/services/http';
import { AlarmContext } from '../context';

export function useAlarmClaim() {
    const { getIntlText } = useI18n();
    const { getDeviceAlarmData } = useContext(AlarmContext) || {};

    const [claimLoading, setClaimLoading] = useState<Record<string, boolean>>({});

    const { run: claimAlarm } = useRequest(
        async (deviceId?: ApiKey) => {
            if (!deviceId) {
                return;
            }

            try {
                setClaimLoading({ [deviceId]: true });
                const [error, resp] = await awaitWrap(
                    deviceAPI.claimDeviceAlarm({
                        device_id: deviceId,
                    }),
                );
                if (error || !isRequestSuccess(resp)) {
                    return;
                }

                getDeviceAlarmData?.();
                toast.success(getIntlText('common.message.operation_success'));
            } finally {
                setClaimLoading({});
            }
        },
        {
            manual: true,
        },
    );

    return {
        claimLoading,
        claimAlarm,
    };
}
