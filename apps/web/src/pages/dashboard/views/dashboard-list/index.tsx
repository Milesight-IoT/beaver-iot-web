import React from 'react';
import { isNil, isEmpty } from 'lodash-es';
import { Stack, Button, OutlinedInput, InputAdornment, List } from '@mui/material';
import cls from 'classnames';

import {
    AddIcon,
    DeleteOutlineIcon,
    SearchIcon,
    LoadingWrapper,
    NoDashboardIcon,
} from '@milesight/shared/src/components';
import { useI18n, useTheme } from '@milesight/shared/src/hooks';

import { PERMISSIONS } from '@/constants';
import { Breadcrumbs, Empty, PermissionControlHidden } from '@/components';
import { useDashboardList } from './hooks';
import { DashboardItems, OperateModal } from './components';
import { useOperateModal } from './components/operate-modal/hooks';
import { useCoverImages } from './components/cover-selection/hooks';

import './style.less';

const DashboardList: React.FC = () => {
    const { matchTablet } = useTheme();
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
        <div
            className={cls('dashboard-list__header', {
                'd-none': matchTablet,
            })}
        >
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

    const renderBody = (isLoading: boolean) => {
        const isNoData = !Array.isArray(data) || isEmpty(data);
        if (isLoading && isNoData) {
            return <List sx={{ height: '300px' }} />;
        }

        if (isNoData) {
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
        // if (!keyword && (isNil(loading) || loading)) {
        //     return (
        //         <LoadingWrapper loading>
        //             <List sx={{ height: '300px' }} />
        //         </LoadingWrapper>
        //     );
        // }

        // if (!keyword && (!Array.isArray(data) || isEmpty(data))) {
        //     return (
        //         <Empty
        //             size="middle"
        //             image={<NoDashboardIcon sx={{ width: '200px', height: '200px' }} />}
        //             text={getIntlText('common.label.empty')}
        //             extra={renderAddDashboard}
        //         />
        //     );
        // }

        const isLoading = isNil(loading) || loading;
        return (
            <>
                {renderHeader}
                <div className="dashboard-list__body ms-perfect-scrollbar">
                    <LoadingWrapper loading={isLoading}>{renderBody(isLoading)}</LoadingWrapper>
                </div>
            </>
        );
    };

    return (
        <div className="ms-main">
            <Breadcrumbs />
            <div
                className={cls('ms-view', 'dashboard-list', {
                    'p-0': matchTablet,
                })}
            >
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
