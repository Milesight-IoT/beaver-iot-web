import React, { useMemo, useContext } from 'react';
import cls from 'classnames';
import { GridFooter } from '@mui/x-data-grid';

import { TablePro, Tooltip } from '@/components';
import { DrawingBoardContext } from '@/components/drawing-board/context';
import { type AlarmConfigType } from '../control-panel';
import { type BoardPluginProps } from '../../../types';
import { useStableValue } from '../../../hooks';
import { useColumns, type TableRowDataType, useDeviceData, generateMockTableData } from './hooks';
import { SearchSlot, DateRangeModal } from './components';

import './style.less';

export interface AlarmViewProps {
    config: AlarmConfigType;
    configJson: BoardPluginProps;
}

const mockData = generateMockTableData(28);

const AlarmView: React.FC<AlarmViewProps> = props => {
    const { config, configJson } = props;
    const { title, devices: unStableValue } = config || {};
    const { isPreview } = configJson || {};
    const context = useContext(DrawingBoardContext);

    const { stableValue: devices } = useStableValue(unStableValue);
    const { columns, paginationModel, setPaginationModel, handleFilterChange } = useColumns({
        isPreview,
    });
    const {
        keyword,
        setKeyword,
        alarmRef,
        alarmContainerWidth,
        selectTime,
        setSelectTime,
        modalVisible,
        setModalVisible,
    } = useDeviceData();

    const toolbarRender = useMemo(() => {
        return (
            <div className="alarm-view__title">
                <Tooltip autoEllipsis title={title} />
            </div>
        );
    }, [title]);

    return (
        <div ref={alarmRef} className="alarm-view">
            <div
                className={cls('alarm-view__table', {
                    fullscreenable: !(isPreview || context?.isEdit),
                })}
            >
                <TablePro<TableRowDataType>
                    loading={false}
                    columns={columns}
                    getRowId={row => row.id}
                    rows={mockData}
                    rowCount={mockData?.length || 0}
                    toolbarRender={toolbarRender}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    searchSlot={
                        <SearchSlot
                            keyword={keyword}
                            setKeyword={setKeyword}
                            selectTime={selectTime}
                            setSelectTime={setSelectTime}
                            setModalVisible={setModalVisible}
                        />
                    }
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

            {modalVisible && (
                <DateRangeModal
                    visible={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    onSuccess={() => setModalVisible(false)}
                />
            )}
        </div>
    );
};

export default AlarmView;
