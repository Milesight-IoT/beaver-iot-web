import React, { useContext } from 'react';
import cls from 'classnames';
import { GridFooter } from '@mui/x-data-grid';

import { useTheme } from '@milesight/shared/src/hooks';

import { TablePro, Tooltip } from '@/components';
import { DrawingBoardContext } from '@/components/drawing-board/context';
import { type AlarmConfigType } from '../control-panel';
import { type BoardPluginProps } from '../../../types';
import { useStableValue } from '../../../hooks';
import { useColumns, type TableRowDataType, useDeviceData } from './hooks';
import { SearchSlot, DateRangeModal, MobileList } from './components';
import { AlarmContext } from './context';

import './style.less';

export interface AlarmViewProps {
    config: AlarmConfigType;
    configJson: BoardPluginProps;
}

const AlarmView: React.FC<AlarmViewProps> = props => {
    const { config, configJson } = props;
    const { title, devices: unStableValue } = config || {};
    const { isPreview } = configJson || {};
    const context = useContext(DrawingBoardContext);

    const { matchTablet } = useTheme();
    const { stableValue: devices } = useStableValue(unStableValue);
    const { columns, paginationModel, setPaginationModel, handleFilterChange } = useColumns({
        isPreview,
    });
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
        contextVal,
    } = useDeviceData();

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
                loading={false}
                columns={columns}
                getRowId={row => row.id}
                rows={data}
                rowCount={data?.length || 0}
                toolbarRender={RenderTitle}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                searchSlot={RenderSearch}
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
        if (matchTablet) {
            return (
                <MobileList
                    headerSlot={
                        <>
                            {RenderTitle}
                            {RenderSearch}
                        </>
                    }
                />
            );
        }

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
