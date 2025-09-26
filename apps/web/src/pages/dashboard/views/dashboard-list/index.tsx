import React from 'react';
import { isNil } from 'lodash-es';
import { Stack, Button, OutlinedInput, InputAdornment, List } from '@mui/material';

import {
    AddIcon,
    DeleteOutlineIcon,
    SearchIcon,
    LoadingWrapper,
    NoDashboardIcon,
} from '@milesight/shared/src/components';
import { useI18n } from '@milesight/shared/src/hooks';

import { PERMISSIONS } from '@/constants';
import { Breadcrumbs, Empty, PermissionControlHidden } from '@/components';
import { useDashboardList } from './hooks';
import { DashboardItems, OperateModal } from './components';
import { useOperateModal } from './components/operate-modal/hooks';
import { useCoverImages } from './components/cover-selection/hooks';

import './style.less';

const DashboardList: React.FC = () => {
    const { getIntlText } = useI18n();
    const {
        loading,
        data,
        keyword,
        existedHomeDashboard,
        selectedDashboard,
        handleSelectDashboard,
        handleSearch,
        getDashboards,
        handleBatchDelDashboard,
    } = useDashboardList();
    const {
        operateModalVisible,
        modalTitle,
        operateType,
        currentDashboard,
        hideModal,
        openAddDashboard,
        openEditDashboard,
        onFormSubmit,
    } = useOperateModal(getDashboards);
    useCoverImages(currentDashboard);

    const renderAddDashboard = (
        <PermissionControlHidden permissions={PERMISSIONS.DASHBOARD_ADD}>
            <Button
                variant="contained"
                sx={{ height: 36, textTransform: 'none' }}
                startIcon={<AddIcon />}
                onClick={openAddDashboard}
            >
                {getIntlText('common.label.add')}
            </Button>
        </PermissionControlHidden>
    );

    const renderHeader = (
        <div className="dashboard-list__header md:d-none">
            <Stack className="ms-operations-btns" direction="row" spacing="12px">
                {renderAddDashboard}
                <PermissionControlHidden permissions={PERMISSIONS.DASHBOARD_DELETE}>
                    <Button
                        variant="outlined"
                        disabled={!selectedDashboard?.length}
                        sx={{ height: 36, textTransform: 'none' }}
                        startIcon={<DeleteOutlineIcon />}
                        onClick={handleBatchDelDashboard}
                    >
                        {getIntlText('common.label.delete')}
                    </Button>
                </PermissionControlHidden>
            </Stack>
            <OutlinedInput
                placeholder={getIntlText('common.label.search')}
                sx={{ width: 220 }}
                onChange={handleSearch}
                startAdornment={
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                }
            />
        </div>
    );

    const renderBody = () => {
        if (loading) {
            return (
                <LoadingWrapper loading>
                    <List sx={{ height: '300px' }} />
                </LoadingWrapper>
            );
        }

        if (!data) {
            return (
                <Empty
                    size="middle"
                    image={<NoDashboardIcon sx={{ width: '200px', height: '200px' }} />}
                    text={getIntlText('common.label.empty')}
                />
            );
        }

        return (
            <DashboardItems
                items={data}
                existedHomeDashboard={existedHomeDashboard}
                selectedDashboard={selectedDashboard}
                handleSelectDashboard={handleSelectDashboard}
                getDashboards={getDashboards}
                openEditDashboard={openEditDashboard}
            />
        );
    };

    const renderContent = () => {
        if (!keyword && (isNil(loading) || loading)) {
            return (
                <LoadingWrapper loading>
                    <List sx={{ height: '300px' }} />
                </LoadingWrapper>
            );
        }

        if (!keyword && !data) {
            return (
                <Empty
                    size="middle"
                    image={<NoDashboardIcon sx={{ width: '200px', height: '200px' }} />}
                    text={getIntlText('common.label.empty')}
                    extra={renderAddDashboard}
                />
            );
        }

        return (
            <>
                {renderHeader}
                <div className="dashboard-list__body ms-perfect-scrollbar">{renderBody()}</div>
            </>
        );
    };

    return (
        <div className="ms-main">
            <Breadcrumbs />
            <div className="ms-view dashboard-list md:p-0">
                <div className="ms-view__inner">{renderContent()}</div>

                {operateModalVisible && (
                    <OperateModal
                        visible={operateModalVisible}
                        operateType={operateType}
                        title={modalTitle}
                        onCancel={hideModal}
                        onFormSubmit={onFormSubmit}
                        data={currentDashboard}
                    />
                )}
            </div>
        </div>
    );
};

export default DashboardList;
