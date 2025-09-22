import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useI18n } from '@milesight/shared/src/hooks';
import { useConfirm } from '@/components';

/**
 * Service Worker Update Confirm
 */
const useSWUpdate = () => {
    const { getIntlText } = useI18n();
    const confirm = useConfirm();

    const {
        updateServiceWorker,
        needRefresh: [needRefresh, setNeedRefresh],
    } = useRegisterSW();

    useEffect(() => {
        if (!needRefresh) return;

        confirm({
            title: getIntlText('common.modal.title_system_upgrade'),
            description: getIntlText('common.modal.title_system_upgrade_description'),
            onConfirm() {
                setNeedRefresh(false);
                updateServiceWorker();
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [needRefresh, getIntlText]);
};

export default useSWUpdate;
