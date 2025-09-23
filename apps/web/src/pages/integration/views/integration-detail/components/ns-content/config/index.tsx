import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Stack } from '@mui/material';
import { useRequest } from 'ahooks';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { AddIcon, DeleteOutlineIcon, toast, CodeIcon } from '@milesight/shared/src/components';
import { TablePro, useConfirm } from '@/components';
import { awaitWrap, isRequestSuccess, embeddedNSApi, getResponseData } from '@/services/http';
import useColumns, { TableRowDataType, UseColumnsProps } from './hook/useColumn';
import { InteEntityType } from '../../../hooks';
import { paginationList } from './utils/utils';
import { GatewayDetail, GatewayDevices, CodecRepo, AddGateway } from './component';

import './style.less';

interface IProps {
    /** Entity list */
    entities?: InteEntityType[];

    /** Edit successful callback */
    onUpdateSuccess?: () => void;
}

/**
 * Embedded NS configuration component
 */
const Config: React.FC<IProps> = ({ entities, onUpdateSuccess }) => {
    const { getIntlText } = useI18n();
    const navigate = useNavigate();
    const confirm = useConfirm();
    const [addOpen, setAddOpen] = useState<boolean>(false);
    const [gatewayDetail, setGatewayDetail] = useState<TableRowDataType | null>(null);
    const [gatewayDevices, setGatewayDevices] = useState<TableRowDataType | null>(null);

    // ---------- list data related to ----------
    const [keyword, setKeyword] = useState<string>();
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [selectedIds, setSelectedIds] = useState<readonly ApiKey[]>([]);
    const [codecOpen, setCodecOpen] = useState<boolean>(false);

    const {
        data: gatewaysData,
        loading,
        run: getGatewayList,
    } = useRequest(
        async () => {
            const [error, resp] = await awaitWrap(embeddedNSApi.getList());
            const data = getResponseData(resp);
            if (error || !data || !isRequestSuccess(resp)) {
                return;
            }
            return objectToCamelCase(data);
        },
        {
            debounceWait: 300,
        },
    );

    const nsData = useMemo(() => {
        const { page, pageSize } = paginationModel;
        return paginationList({
            dataList: gatewaysData?.gateways || [],
            search: keyword,
            pageSize,
            pageNumber: page + 1,
            filterCondition: (item, search: string) => {
                return [item?.name]
                    .map(v => v?.toLocaleLowerCase() || '')
                    .filter(Boolean)
                    .some(value => value.includes(search.toLocaleLowerCase()));
            },
        });
    }, [gatewaysData, keyword, paginationModel]);

    // ---------- Data Deletion related ----------
    const handleDeleteConfirm = useCallback(
        (ids?: ApiKey[]) => {
            const idsToDelete = ids || [...selectedIds];
            confirm({
                title: getIntlText(
                    idsToDelete?.length > 1 ? 'common.label.bulk_deletion' : 'common.label.delete',
                ),
                description:
                    idsToDelete?.length > 1
                        ? getIntlText('setting.integration.gateway.delete_bulk_tip', {
                              1: idsToDelete.length,
                          })
                        : getIntlText('setting.integration.gateway.delete_tip'),
                confirmButtonText: getIntlText('common.label.delete'),
                type: 'warning',
                onConfirm: async () => {
                    const [error, resp] = await awaitWrap(
                        embeddedNSApi.deleteGateWay({ gateways: idsToDelete }),
                    );

                    if (error || !isRequestSuccess(resp)) return;

                    getGatewayList();
                    onUpdateSuccess?.();
                    toast.success(getIntlText('common.message.delete_success'));
                },
            });
        },
        [confirm, getIntlText, getGatewayList, selectedIds],
    );

    // setAddOpen(true);
    const handleCusCodec = () => {
        setCodecOpen(true);
    };

    // enter device detail
    const handleDetail = (gateWay: TableRowDataType) => {
        setGatewayDetail(gateWay);
    };

    // enter device list
    const handleGotoDevice = (gateWay: TableRowDataType) => {
        setGatewayDevices(gateWay);
    };

    // ---------- Table rendering related to ----------
    const toolbarRender = useMemo(() => {
        return (
            <Stack className="ms-operations-btns" direction="row" spacing="12px">
                <Button
                    variant="contained"
                    sx={{ textTransform: 'none' }}
                    startIcon={<AddIcon />}
                    onClick={() => setAddOpen(true)}
                >
                    {getIntlText('common.label.add')}
                </Button>
                {/* <Button
                    variant="outlined"
                    sx={{ textTransform: 'none' }}
                    startIcon={<CodeIcon fontSize="small" />}
                    onClick={handleCusCodec}
                >
                    {getIntlText('setting.integration.label.codec_repo_title')}
                </Button> */}
                <Button
                    variant="outlined"
                    disabled={!selectedIds.length}
                    sx={{ textTransform: 'none' }}
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
                case 'detail': {
                    handleDetail(record);
                    break;
                }
                case 'device': {
                    handleGotoDevice(record);
                    break;
                }
                case 'delete': {
                    handleDeleteConfirm([record.eui]);
                    break;
                }
                default: {
                    break;
                }
            }
        },
        [navigate, handleDeleteConfirm],
    );

    const columns = useColumns<TableRowDataType>({ onButtonClick: handleTableBtnClick });

    return (
        <div className="ms-view ms-view-ns">
            <div className="ms-view-inner">
                <TablePro<TableRowDataType>
                    filterCondition={[keyword]}
                    checkboxSelection
                    getRowId={(row: TableRowDataType) => row.eui}
                    loading={loading}
                    columns={columns}
                    rows={nsData?.content}
                    rowCount={nsData?.total || 0}
                    paginationModel={paginationModel}
                    rowSelectionModel={selectedIds}
                    toolbarRender={toolbarRender}
                    onPaginationModelChange={setPaginationModel}
                    onRowSelectionModelChange={setSelectedIds}
                    onRowDoubleClick={({ row }) => {
                        setGatewayDetail(row);
                    }}
                    onSearch={value => {
                        setKeyword(value);
                        setPaginationModel(model => ({ ...model, page: 0 }));
                    }}
                    onRefreshButtonClick={getGatewayList}
                />
            </div>
            {!!gatewayDetail && (
                <GatewayDetail
                    visible={!!gatewayDetail}
                    onCancel={() => setGatewayDetail(null)}
                    gatewayInfo={gatewayDetail}
                />
            )}
            {addOpen && (
                <AddGateway
                    visible={addOpen}
                    onCancel={() => setAddOpen(false)}
                    onUpdateSuccess={onUpdateSuccess}
                    refreshTable={getGatewayList}
                />
            )}
            {!!gatewayDevices && (
                <GatewayDevices
                    visible={!!gatewayDevices}
                    onCancel={() => setGatewayDevices(null)}
                    refreshTable={getGatewayList}
                    onUpdateSuccess={onUpdateSuccess}
                    gatewayInfo={gatewayDevices}
                />
            )}
            {codecOpen && (
                <CodecRepo
                    visible={codecOpen}
                    entities={entities}
                    onCancel={() => setCodecOpen(false)}
                    onUpdateSuccess={onUpdateSuccess}
                />
            )}
        </div>
    );
};

export default Config;
