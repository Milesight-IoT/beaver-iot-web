import { useState } from 'react';
import { useRequest } from 'ahooks';

import { useI18n } from '@milesight/shared/src/hooks';
import { toast } from '@milesight/shared/src/components';

import { deviceAPI, awaitWrap, isRequestSuccess } from '@/services/http';

export function useAlarmClaim(refreshList?: () => void) {
    const { getIntlText } = useI18n();

    const [claimLoading, setClaimLoading] = useState<Record<string, boolean>>({});

    const { run: claimAlarm } = useRequest(
        async (deviceId?: ApiKey, alarmId?: ApiKey) => {
            if (!deviceId || !alarmId) {
                return;
            }

            try {
                setClaimLoading({ [alarmId]: true });
                const [error, resp] = await awaitWrap(
                    deviceAPI.claimDeviceAlarm({
                        device_id: deviceId,
                    }),
                );
                if (error || !isRequestSuccess(resp)) {
                    return;
                }

                refreshList?.();
                toast.success(getIntlText('common.message.operation_success'));
            } finally {
                setClaimLoading({});
            }
        },
        {
            manual: true,
            debounceWait: 300,
        },
    );

    return {
        claimLoading,
        claimAlarm,
    };
}
