import React, { useCallback, useState } from 'react';
import { Stack } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { toast } from '@milesight/shared/src/components';
import { FiltersRecordType, FilterValue, TablePro, TableProProps } from '@/components';
import { awaitWrap, entityAPI, isRequestSuccess, type DeviceAPISchema } from '@/services/http';
import useColumns, { type TableRowDataType, type UseColumnsProps } from './hooks/useColumns';
import EditEntity from '../edit-entity';
import EntityDetail from '../entity-detail';

interface Props {
    data?: ObjectToCamelCase<DeviceAPISchema['getDetail']['response']>;

    /** Click the Table refresh button to call back */
    onRefresh?: () => void;
}

/**
 * Device physical data table
 */
const EntityTable: React.FC<Props> = ({ data, onRefresh }) => {
    const { getIntlText } = useI18n();

    const [detail, setDetail] = useState<TableRowDataType | null>(null);
    const [detailVisible, setDetailVisible] = useState<boolean>(false);
    const [editVisible, setEditVisible] = useState<boolean>(false);
    const [filteredInfo, setFilteredInfo] = useState<FiltersRecordType>({});

    const handleFilterChange: TableProProps<TableRowDataType>['onFilterInfoChange'] = (
        filters: Record<string, FilterValue | null>,
    ) => {
        setFilteredInfo(filters);
    };

    const handleDetail = (data: TableRowDataType) => {
        setDetail(data);
        setDetailVisible(true);
    };

    const handleDetailClose = () => {
        setDetailVisible(false);
        setDetail(null);
    };

    const showEdit = (data: TableRowDataType) => {
        setDetail(data);
        setEditVisible(true);
    };

    const handleEditClose = () => {
        setEditVisible(false);
        setDetail(null);
    };

    const handleEdit = async (name: string) => {
        const [error, resp] = await awaitWrap(entityAPI.editEntity({ name, id: detail?.id || '' }));

        if (error || !isRequestSuccess(resp)) return;

        setEditVisible(false);
        onRefresh?.();
        setDetail(null);
        toast.success(getIntlText('common.message.operation_success'));
    };

    const handleTableBtnClick: UseColumnsProps<TableRowDataType>['onButtonClick'] = useCallback(
        (type, record) => {
            switch (type) {
                case 'detail': {
                    handleDetail(record);
                    break;
                }
                case 'edit': {
                    showEdit(record);
                    break;
                }
                default: {
                    break;
                }
            }
        },
        [],
    );
    const columns = useColumns<TableRowDataType>({
        onButtonClick: handleTableBtnClick,
        filteredInfo,
    });

    return (
        <Stack className="ms-com-device-entity" sx={{ height: '100%' }}>
            <TablePro<TableRowDataType>
                paginationMode="client"
                loading={false}
                columns={columns}
                rows={data?.entities}
                rowCount={data?.entities?.length}
                onRefreshButtonClick={onRefresh}
                onFilterInfoChange={handleFilterChange}
            />
            {detailVisible && !!detail && (
                <EntityDetail onCancel={handleDetailClose} detail={detail} />
            )}
            {editVisible && !!detail && (
                <EditEntity onCancel={handleEditClose} onOk={handleEdit} data={detail} />
            )}
        </Stack>
    );
};

export default EntityTable;
