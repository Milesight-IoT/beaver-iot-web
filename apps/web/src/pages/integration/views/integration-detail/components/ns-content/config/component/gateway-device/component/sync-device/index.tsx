import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Stack } from '@mui/material';
import { useDebounceEffect, useRequest } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { DeleteOutlineIcon, toast } from '@milesight/shared/src/components';
import { TablePro, useConfirm } from '@/components';
import {
    awaitWrap,
    isRequestSuccess,
    embeddedNSApi,
    getResponseData,
    GatewayDetailType,
    deviceAPI,
    SyncedDeviceType,
} from '@/services/http';
import { paginationList } from '../../../../utils/utils';
import useColumns, { TableRowDataType, UseColumnsProps } from './hook/useColumn';

interface IProps {
    /** Edit successful callback */
    gatewayInfo: ObjectToCamelCase<GatewayDetailType>;
    // update event
    onUpdateSuccess?: () => void;
    // refresh table
    refreshTable: () => void;
    devicesData: ObjectToCamelCase<SyncedDeviceType>[];
    loading: boolean;
    getDevicesList: (reset?: boolean) => void;
}

/**
 * synced device component
 */
const SyncedDevice: React.FC<IProps> = props => {
    const { gatewayInfo, onUpdateSuccess, refreshTable, devicesData, loading, getDevicesList } =
        props;
    const { getIntlText } = useI18n();

    // ---------- list data related to ----------
    const [keyword, setKeyword] = useState<string>();
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [selectedIds, setSelectedIds] = useState<readonly ApiKey[]>([]);

    useDebounceEffect(
        () => {
            getDevicesList(true);
        },
        [],
        { wait: 300 },
    );

    const deviceData = useMemo(() => {
        const { page, pageSize } = paginationModel;
        return paginationList({
            dataList: devicesData || [],
            search: keyword,
            pageSize,
            pageNumber: page + 1,
            filterCondition: (item, search: string) => {
                return [item?.name, item.eui]
                    .map(v => v?.toLocaleLowerCase() || '')
                    .filter(Boolean)
                    .some(value => value.includes(search.toLocaleLowerCase()));
            },
        });
    }, [devicesData, keyword, paginationModel]);

    // ---------- Data Deletion related ----------
    const confirm = useConfirm();
    const handleDeleteConfirm = useCallback(
        (ids?: ApiKey[]) => {
            const idsToDelete = ids || [...selectedIds];
            confirm({
                title: getIntlText(
                    idsToDelete?.length > 1 ? 'common.label.bulk_deletion' : 'common.label.delete',
                ),
                description:
                    idsToDelete?.length > 1
                        ? getIntlText('setting.integration.label.device_bulk_delete_tip', {
                              1: idsToDelete.length,
                          })
                        : getIntlText('setting.integration.label.device_delete_tip'),
                confirmButtonText: getIntlText('common.label.delete'),
                type: 'warning',
                onConfirm: async () => {
                    const [error, resp] = await awaitWrap(
                        deviceAPI.deleteDevices({ device_id_list: idsToDelete }),
                    );

                    if (error || !isRequestSuccess(resp)) {
                        return;
                    }

                    getDevicesList();
                    onUpdateSuccess?.();
                    refreshTable();
                    toast.success(getIntlText('common.message.delete_success'));
                },
            });
        },
        [confirm, getIntlText, getDevicesList, selectedIds],
    );

    // ---------- Table rendering related to ----------
    const toolbarRender = useMemo(() => {
        return (
            <Stack className="ms-operations-btns" direction="row" spacing="12px">
                <Button
                    variant="outlined"
                    disabled={!selectedIds.length}
                    sx={{ height: 36, textTransform: 'none' }}
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => handleDeleteConfirm()}
                >
                    {getIntlText('common.label.delete')}
                </Button>
            </Stack>
        );
    }, [getIntlText, handleDeleteConfirm, selectedIds]);

    const handleTableBtnClick: UseColumnsProps<TableRowDataType>['onButtonClick'] = useCallback(
        (type, record) => {
            switch (type) {
                case 'delete': {
                    handleDeleteConfirm([record.id]);
                    break;
                }
                default: {
                    break;
                }
            }
        },
        [handleDeleteConfirm],
    );

    const columns = useColumns<TableRowDataType>({ onButtonClick: handleTableBtnClick });

    return (
        <div className="ms-ns-device">
            <div className="ms-ns-device-inner ms-ns-synced-device">
                <TablePro<TableRowDataType>
                    filterCondition={[keyword]}
                    checkboxSelection
                    loading={loading}
                    columns={columns}
                    getRowId={record => record.id}
                    rows={deviceData?.content}
                    rowCount={deviceData?.total || 0}
                    paginationModel={paginationModel}
                    rowSelectionModel={selectedIds}
                    toolbarRender={toolbarRender}
                    onPaginationModelChange={setPaginationModel}
                    onRowSelectionModelChange={setSelectedIds}
                    onSearch={value => {
                        setKeyword(value);
                        setPaginationModel(model => ({ ...model, page: 0 }));
                    }}
                    onRefreshButtonClick={() => getDevicesList(false)}
                />
            </div>
        </div>
    );
};

export default SyncedDevice;
