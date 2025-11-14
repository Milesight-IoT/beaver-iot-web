import React, { useContext, useMemo, useRef } from 'react';
import cls from 'classnames';
import { GridFooter } from '@mui/x-data-grid';

import { useTheme } from '@milesight/shared/src/hooks';

import { TablePro, Tooltip } from '@/components';
import { DrawingBoardContext } from '@/components/drawing-board/context';
import { type AlarmConfigType } from '../control-panel';
import { type BoardPluginProps } from '../../../types';
import { useStableValue } from '../../../hooks';
import { useColumns, type TableRowDataType, useDeviceData, useDeviceEntities } from './hooks';
import { SearchSlot, DateRangeModal, MobileList, type MobileDeviceListExpose } from './components';
import { AlarmContext, type AlarmContextProps } from './context';

import './style.less';

export interface AlarmViewProps {
    config: AlarmConfigType;
    configJson: BoardPluginProps;
}

const AlarmView: React.FC<AlarmViewProps> = props => {
    const { config, configJson } = props;
    const { title, devices: unStableValue, defaultTime } = config || {};
    const { isPreview } = configJson || {};
    const context = useContext(DrawingBoardContext);

    const mobileListRef = useRef<MobileDeviceListExpose>(null);
    const { matchTablet } = useTheme();
    const { stableValue: devices } = useStableValue(unStableValue);
    const {
        data,
        keyword,
        setKeyword,
        alarmRef,
        alarmContainerWidth,
        selectTime,
        setSelectTime,
        modalVisible,
        setModalVisible,
        timeRange,
        setTimeRange,
        handleCustomTimeRange,
        onSelectTime,
        showMobileSearch,
        setShowMobileSearch,
        loading,
        getDeviceAlarmData,
        searchConditionRef,
        paginationModel,
        setPaginationModel,
        filteredInfo,
        handleFilterChange,
    } = useDeviceData({
        devices,
        defaultTime,
    });
    /**
     * Handle listening devices entities status refresh
     */
    useDeviceEntities({
        devices,
        refreshList: () => {
            if (matchTablet) {
                mobileListRef.current?.refreshList?.();
            } else {
                getDeviceAlarmData?.();
            }
        },
    });
    const { columns } = useColumns({
        isPreview,
        refreshList: getDeviceAlarmData,
        filteredInfo,
    });

    const contextVal = useMemo(
        (): AlarmContextProps => ({
            devices,
            showMobileSearch,
            setShowMobileSearch,
            timeRange,
            setTimeRange,
            searchConditionRef,
            selectTime,
            isPreview,
            setPaginationModel,
        }),
        [
            devices,
            showMobileSearch,
            timeRange,
            setShowMobileSearch,
            setTimeRange,
            searchConditionRef,
            selectTime,
            isPreview,
            setPaginationModel,
        ],
    );

    const RenderTitle = (
        <div className="alarm-view__title">
            <Tooltip autoEllipsis title={title} />
        </div>
    );

    const RenderSearch = (
        <SearchSlot
            keyword={keyword}
            setKeyword={setKeyword}
            selectTime={selectTime}
            setSelectTime={setSelectTime}
            setModalVisible={setModalVisible}
            onSelectTime={onSelectTime}
        />
    );

    const RenderTable = (
        <div
            className={cls('alarm-view__table', {
                fullscreenable: !(isPreview || context?.isEdit),
            })}
        >
            <TablePro<TableRowDataType>
                loading={loading}
                columns={columns}
                getRowId={row => row.id}
                rows={data?.content || []}
                rowCount={data?.total || 0}
                toolbarRender={RenderTitle}
                pageSizeOptions={[10, 20, 30, 40, 50, 100]}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                searchSlot={RenderSearch}
                filterCondition={[keyword, filteredInfo, selectTime]}
                onFilterInfoChange={handleFilterChange}
                rowHeight={64}
                slots={{
                    footer: GridFooter,
                }}
                slotProps={{
                    footer: {
                        sx: {
                            '& .MuiTablePagination-root': {
                                overflow: 'hidden',
                            },
                            '& .MuiTablePagination-root .MuiTablePagination-selectLabel': {
                                display: alarmContainerWidth > 500 ? undefined : 'none',
                            },
                            '& .MuiTablePagination-root .MuiTablePagination-input': {
                                display: alarmContainerWidth > 500 ? undefined : 'none',
                            },
                        },
                    },
                    pagination: {
                        showFirstButton: true,
                        showLastButton: true,
                    },
                }}
            />
        </div>
    );

    const renderContent = () => {
        /**
         * Render mobile list
         */
        if (matchTablet) {
            return (
                <MobileList
                    ref={mobileListRef}
                    headerSlot={
                        <>
                            {RenderTitle}
                            {RenderSearch}
                        </>
                    }
                />
            );
        }

        /**
         * Render desktop table
         */
        return RenderTable;
    };

    return (
        <AlarmContext.Provider value={contextVal}>
            <div ref={alarmRef} className="alarm-view">
                {renderContent()}

                {modalVisible && (
                    <DateRangeModal
                        visible={modalVisible}
                        onCancel={() => setModalVisible(false)}
                        onSuccess={handleCustomTimeRange}
                        timeRange={timeRange}
                        setTimeRange={setTimeRange}
                    />
                )}
            </div>
        </AlarmContext.Provider>
    );
};

export default AlarmView;
