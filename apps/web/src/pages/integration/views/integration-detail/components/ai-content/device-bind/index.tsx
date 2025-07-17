import { useCallback, useMemo, useState } from 'react';
import { Button, Stack } from '@mui/material';
import { useRequest } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { AddIcon, DeleteOutlineIcon, toast } from '@milesight/shared/src/components';
import { TablePro, useConfirm } from '@/components';
import { camthinkApi, awaitWrap, isRequestSuccess, getResponseData } from '@/services/http';
import { InteEntityType } from '../../../hooks';
import { entitiesCompose } from '../helper';
import { AI_SERVICE_KEYWORD } from '../constants';
import { LogModal, BindModal } from './components';
import useColumns, { type UseColumnsProps, type TableRowDataType } from './useColumns';

import './style.less';

interface IProps {
    /** Entity list */
    entities?: InteEntityType[];

    /** Service Entity Key that the page does not render */
    excludeKeys?: ApiKey[];

    /** Edit successful callback */
    onUpdateSuccess?: () => void;
}

/**
 * device binding component
 */
const DeviceBind: React.FC<IProps> = ({ entities, excludeKeys }) => {
    const { getIntlText } = useI18n();

    // ---------- Get device list ----------
    const [keyword, setKeyword] = useState<string>();
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const {
        loading,
        run: getBoundDevices,
        data: deviceData,
    } = useRequest(
        async () => {
            const { pageSize, page } = paginationModel;
            const [err, resp] = await awaitWrap(
                camthinkApi.getBoundDevices({
                    name: keyword,
                    page_size: pageSize,
                    page_number: page + 1,
                }),
            );
            if (err || !isRequestSuccess(resp)) return;
            return getResponseData(resp);
        },
        {
            debounceWait: 300,
            refreshDeps: [keyword, paginationModel],
        },
    );

    // ---------- Delete related ----------
    const confirm = useConfirm();
    const handleDeleteConfirm = useCallback(
        (ids: ApiKey[] | readonly ApiKey[]) => {
            confirm({
                type: 'warning',
                title: getIntlText('common.label.delete'),
                description: getIntlText('setting.integration.ai_bind_delete_tip'),
                confirmButtonText: getIntlText('common.label.delete'),
                onConfirm: async () => {
                    const [error, resp] = await awaitWrap(
                        camthinkApi.unbindDevices({ device_ids: [...ids] }),
                    );

                    // console.log({ error, resp });
                    if (error || !isRequestSuccess(resp)) return;

                    getBoundDevices();
                    setSelectedIds([]);
                    toast.success(getIntlText('common.message.delete_success'));
                },
            });
        },
        [confirm, getIntlText, getBoundDevices],
    );

    // ---------- Render table and handle actions ----------
    const [selectedIds, setSelectedIds] = useState<readonly ApiKey[]>([]);
    const [openBind, setOpenBind] = useState(false);
    const [logDevice, setLogDevice] = useState<TableRowDataType | null>(null);
    const [detailDevice, setDetailDevice] = useState<TableRowDataType | null>(null);
    const toolbarRender = useMemo(() => {
        return (
            <Stack className="ms-operations-btns" direction="row" spacing="12px">
                <Button
                    variant="contained"
                    className="md:d-none"
                    sx={{ height: 36, textTransform: 'none' }}
                    startIcon={<AddIcon />}
                    onClick={() => setOpenBind(true)}
                >
                    {getIntlText('setting.integration.ai_bind_device')}
                </Button>
                <Button
                    variant="outlined"
                    className="md:d-none"
                    disabled={!selectedIds.length}
                    sx={{ height: 36, textTransform: 'none' }}
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => {
                        if (!selectedIds.length) return;
                        handleDeleteConfirm(selectedIds);
                    }}
                >
                    {getIntlText('common.label.delete')}
                </Button>
            </Stack>
        );
    }, [selectedIds, getIntlText, handleDeleteConfirm]);

    const handleTableBtnClick: UseColumnsProps<TableRowDataType>['onButtonClick'] = useCallback(
        (type, record) => {
            switch (type) {
                case 'detail': {
                    setOpenBind(true);
                    setDetailDevice(record);
                    break;
                }
                case 'log': {
                    setLogDevice(record);
                    break;
                }
                case 'delete': {
                    handleDeleteConfirm([record.device_id]);
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

    // ---------- Compose AI Model list ----------
    const aiModelEntities = useMemo(() => {
        const result = entitiesCompose(entities, excludeKeys).filter(item =>
            `${item.key}`.includes(AI_SERVICE_KEYWORD),
        );

        return result;
    }, [entities, excludeKeys]);

    return (
        <div className="ms-view-ai-device-bind">
            <TablePro<TableRowDataType>
                checkboxSelection
                getRowId={record => record.device_id}
                loading={loading}
                columns={columns}
                rows={deviceData?.content || []}
                rowCount={deviceData?.total || 0}
                paginationModel={paginationModel}
                rowSelectionModel={selectedIds}
                toolbarRender={toolbarRender}
                onPaginationModelChange={setPaginationModel}
                onRowSelectionModelChange={setSelectedIds}
                onRowDoubleClick={({ row }) => {
                    setOpenBind(true);
                    setDetailDevice(row);
                }}
                onSearch={value => {
                    setKeyword(value);
                    setPaginationModel(model => ({ ...model, page: 0 }));
                }}
                onRefreshButtonClick={getBoundDevices}
            />
            <LogModal
                device={logDevice}
                visible={!!logDevice}
                onCancel={() => setLogDevice(null)}
            />
            <BindModal
                visible={openBind}
                device={detailDevice}
                entities={aiModelEntities}
                onCancel={() => {
                    setOpenBind(false);
                    setDetailDevice(null);
                }}
                onSuccess={() => {
                    getBoundDevices();
                    setOpenBind(false);
                }}
            />
        </div>
    );
};

export default DeviceBind;
