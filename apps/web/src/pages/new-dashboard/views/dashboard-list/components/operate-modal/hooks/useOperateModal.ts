import { useState } from 'react';
import { useMemoizedFn } from 'ahooks';

import { useI18n } from '@milesight/shared/src/hooks';
import { toast } from '@milesight/shared/src/components';

import { type DashboardListProps } from '@/services/http';
import useCoverCroppingStore from '../../cover-selection/components/cover-cropping/store';
import { MANUAL_UPLOAD } from '../../cover-selection/constants';
import type { OperateModalType, OperateDashboardProps } from '../index';

/**
 * Add or edit dashboard modal hook
 */
export function useOperateModal(getDashboards?: () => void) {
    const { getIntlText } = useI18n();
    const { getCanvasCroppingImage } = useCoverCroppingStore();

    const [operateModalVisible, setOperateModalVisible] = useState(false);
    const [operateType, setOperateType] = useState<OperateModalType>('add');
    const [modalTitle, setModalTitle] = useState(getIntlText('dashboard.add_title'));
    const [currentDashboard, setCurrentDashboard] = useState<DashboardListProps>();

    const hideModal = useMemoizedFn(() => {
        setOperateModalVisible(false);
    });

    const openAddDashboard = useMemoizedFn(() => {
        setOperateType('add');
        setModalTitle(getIntlText('dashboard.add_title'));
        setOperateModalVisible(true);
        setCurrentDashboard(undefined);
    });

    const openEditDashboard = useMemoizedFn((item: DashboardListProps) => {
        setOperateType('edit');
        setModalTitle(getIntlText('dashboard.edit_title'));
        setOperateModalVisible(true);
        setCurrentDashboard(item);
    });

    const handleAddDashboard = useMemoizedFn(
        async (data: OperateDashboardProps, callback: () => void) => {
            if (!data) return;

            console.log('handleAddDashboard ? ', data);
            if (data?.cover === MANUAL_UPLOAD) {
                const url = await getCanvasCroppingImage?.();
                console.log('url ? ', url);
            }

            // getDashboards?.();
            // setOperateModalVisible(false);
            toast.success(getIntlText('common.message.add_success'));
            // callback?.();
        },
    );

    const handleEditDashboard = useMemoizedFn(
        async (data: OperateDashboardProps, callback: () => void) => {
            if (!currentDashboard?.dashboard_id || !data) return;

            console.log('handleEditDashboard ? ', currentDashboard, data);

            getDashboards?.();
            setOperateModalVisible(false);
            toast.success(getIntlText('common.message.operation_success'));
            callback?.();
        },
    );

    const onFormSubmit = useMemoizedFn(
        async (data: OperateDashboardProps, callback: () => void) => {
            if (!data) return;

            if (operateType === 'add') {
                await handleAddDashboard(data, callback);
                return;
            }

            await handleEditDashboard(data, callback);
        },
    );

    return {
        operateModalVisible,
        modalTitle,
        operateType,
        currentDashboard,
        hideModal,
        openAddDashboard,
        openEditDashboard,
        onFormSubmit,
    };
}
