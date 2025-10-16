import { useState } from 'react';
import { useMemoizedFn } from 'ahooks';
import { useNavigate } from 'react-router-dom';

import { useI18n } from '@milesight/shared/src/hooks';
import { toast } from '@milesight/shared/src/components';

import {
    type DashboardListProps,
    type DashboardCoverType,
    dashboardAPI,
    isRequestSuccess,
    awaitWrap,
    getResponseData,
} from '@/services/http';
import useCoverCroppingStore from '../../cover-selection/components/cover-cropping/store';
import { MANUAL_UPLOAD } from '../../cover-selection/constants';
import useDashboardListStore from '../../../store';
import type { OperateModalType, OperateDashboardProps } from '../index';

/**
 * Add or edit dashboard modal hook
 */
export function useOperateModal(getDashboards?: () => void) {
    const { getIntlText } = useI18n();
    const { getCanvasCroppingImage } = useCoverCroppingStore();
    const { coverImages } = useDashboardListStore();
    const navigate = useNavigate();

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

    /**
     * Get dashboard cover info data
     */
    const getCoverInfo = useMemoizedFn(async (cover?: string) => {
        let coverType: DashboardCoverType = 'DEFAULT_IMAGE';
        let newCover = cover;
        if (cover === MANUAL_UPLOAD) {
            coverType = 'RESOURCE';
            const url = await getCanvasCroppingImage?.();

            newCover = url || '';
        } else {
            const image = coverImages.find(c => c.data === newCover);
            coverType = image?.type || 'DEFAULT_IMAGE';
        }

        return {
            coverType,
            newCover,
        };
    });

    const handleAddDashboard = useMemoizedFn(
        async (data: OperateDashboardProps, callback: () => void) => {
            if (!data) return;

            const { name, cover, description } = data || {};
            const { coverType, newCover } = await getCoverInfo(cover);

            const [error, resp] = await awaitWrap(
                dashboardAPI.addDashboard({
                    name,
                    description,
                    cover_type: coverType,
                    cover_data: newCover,
                }),
            );
            if (error || !isRequestSuccess(resp)) {
                return;
            }

            getDashboards?.();
            setOperateModalVisible(false);
            toast.success(getIntlText('common.message.add_success'));
            callback?.();

            /** Jump dashboard main_canvas_id */
            const result = getResponseData(resp);
            const jumpId = result?.main_canvas_id;
            if (jumpId) {
                navigate(`/dashboard?id=${jumpId}`);
            }
        },
    );

    const handleEditDashboard = useMemoizedFn(
        async (data: OperateDashboardProps, callback: () => void) => {
            if (!currentDashboard?.dashboard_id || !data) return;

            const { name, cover, description } = data || {};
            const { coverType, newCover } = await getCoverInfo(cover);

            const [error, resp] = await awaitWrap(
                dashboardAPI.updateDashboard({
                    dashboard_id: currentDashboard.dashboard_id,
                    name,
                    description,
                    cover_type: coverType,
                    cover_data: newCover,
                }),
            );
            if (error || !isRequestSuccess(resp)) {
                return;
            }

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
