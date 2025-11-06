import React, { useMemo, useContext } from 'react';
import cls from 'classnames';

import { TablePro, HoverSearchInput, Tooltip } from '@/components';
import { DrawingBoardContext } from '@/components/drawing-board/context';
import { type AlarmConfigType } from '../control-panel';
import { type BoardPluginProps } from '../../../types';
import { useStableValue } from '../../../hooks';
import { useColumns, type TableRowDataType, useDeviceData, generateMockTableData } from './hooks';

import './style.less';

export interface AlarmViewProps {
    config: AlarmConfigType;
    configJson: BoardPluginProps;
}

const mockData = generateMockTableData(120);

const AlarmView: React.FC<AlarmViewProps> = props => {
    const { config, configJson } = props;
    const { title, devices: unStableValue } = config || {};
    const { isPreview } = configJson || {};
    const context = useContext(DrawingBoardContext);

    const { stableValue: devices } = useStableValue(unStableValue);

    const { keyword, setKeyword } = useDeviceData();
    const { columns, paginationModel, setPaginationModel } = useColumns({ isPreview });

    const toolbarRender = useMemo(() => {
        return (
            <div className="alarm-view__title">
                <Tooltip autoEllipsis title={title} />
            </div>
        );
    }, [title]);

    return (
        <div className="alarm-view">
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
                    searchSlot={<HoverSearchInput keyword={keyword} changeKeyword={setKeyword} />}
                />
            </div>
        </div>
    );
};

export default AlarmView;
