import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Stack } from '@mui/material';
import { useRequest } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { AddIcon, DeleteOutlineIcon, toast } from '@milesight/shared/src/components';
import { Breadcrumbs, TablePro, useConfirm } from '@/components';
import { parserAPI, pluginAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import { useColumns, type UseColumnsProps, type TableRowDataType } from './hooks';
import { AddModal } from './components';
import ParserDialog from './ParserDialog';
import './style.less';

export default () => {
    
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const navigate = useNavigate();
    const { getIntlText } = useI18n();

    // ---------- 列表数据相关 ----------
    const [keyword, setKeyword] = useState<string>();
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [selectedIds, setSelectedIds] = useState<readonly ApiKey[]>([]);
    const {
        data: plugineData,
        loading,
        run: getPluginList,
    } = useRequest(
        async () => {
            const { page, pageSize } = paginationModel;
            const [error, resp] = await awaitWrap(
                pluginAPI.getPluginList({
                    name: keyword,
                    page_size: pageSize,
                    page_number: page + 1,
                }),
            );
            const data = getResponseData(resp);

            // console.log({ error, resp });
            if (error || !data || !isRequestSuccess(resp)) return;

            return objectToCamelCase(data);
        },
        {
            debounceWait: 300,
            refreshDeps: [keyword, paginationModel],
        },
    );

    // ---------- 设备添加相关 ----------
    const [modalOpen, setModalOpen] = useState(false);

    // ---------- 数据删除相关 ----------
    const confirm = useConfirm();
    const handleDeleteConfirm = useCallback(
        (ids?: ApiKey[]) => {
            const idsToDelete = ids || [...selectedIds];

            confirm({
                title: getIntlText('common.label.delete'),
                description: getIntlText('device.message.delete_tip'),
                confirmButtonText: getIntlText('common.label.delete'),
                confirmButtonProps: {
                    color: 'error',
                },
                onConfirm: async () => {
                    const [error, resp] = await awaitWrap(
                        pluginAPI.deletePlugins({ plugin_id_list: idsToDelete }),
                    );

                    console.log({ error, resp });
                    if (error || !isRequestSuccess(resp)) return;

                    getPluginList();
                    setSelectedIds([]);
                    toast.success(getIntlText('common.message.delete_success'));
                },
            });
        },
        [confirm, getIntlText, getPluginList, selectedIds],
    );

    const handleParserConfirm = useCallback(
        (row) => {
            setSelectedRow(row);
            setDialogOpen(true);
        },
        [],
    );

    const handleParserSubmit = async (inputText, type) => {
        const [error, resp] = await awaitWrap(
            parserAPI.parser({ model: selectedRow[0], input: inputText, type }),
        );

        if (error || !isRequestSuccess(resp)) {
            toast.error(getIntlText('common.message.parse_failed'));
            return [error, null];
        }

        toast.success(getIntlText('common.message.parse_success'));
        return [null, resp.data]; // 假设 resp.data 是解析后的文本
    };


    // ---------- Table 渲染相关 ----------
    const toolbarRender = useMemo(() => {
        return (
            <Stack className="ms-operations-btns" direction="row" spacing="12px">
                <Button
                    variant="contained"
                    sx={{ height: 36, textTransform: 'none' }}
                    startIcon={<AddIcon />}
                    onClick={() => setModalOpen(true)}
                >
                    {getIntlText('common.label.add')}
                </Button>
                <Button
                    variant="outlined"
                    color="error"
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
            // console.log(type, record);
            switch (type) {
                // case 'detail': {
                //     navigate(`/device/detail/${record.id}`, { state: record });
                //     break;
                // }
                // case 'parser': {
                //     handleParserConfirm([record.id]);
                //     break;
                // }
                case 'delete': {
                    handleDeleteConfirm([record.id]);
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
        <div className="ms-main">
            {/* <Breadcrumbs /> */}
            <div className="ms-view ms-view-device">
                <div className="ms-view__inner">
                    <TablePro<TableRowDataType>
                        checkboxSelection
                        loading={loading}
                        columns={columns}
                        rows={plugineData?.content}
                        rowCount={plugineData?.total || 0}
                        paginationModel={paginationModel}
                        rowSelectionModel={selectedIds}
                        isRowSelectable={({ row }) => row.deletable}
                        toolbarRender={toolbarRender}
                        onPaginationModelChange={setPaginationModel}
                        onRowSelectionModelChange={setSelectedIds}
                        // onRowDoubleClick={({ row }) => {
                        //     navigate(`/device/detail/${row.id}`, { state: row });
                        // }}
                        onSearch={setKeyword}
                        onRefreshButtonClick={getPluginList}
                    />
                </div>
            </div>
            <AddModal
                visible={modalOpen}
                onCancel={() => setModalOpen(false)}
                onSuccess={() => {
                    getPluginList();
                    setModalOpen(false);
                }}
            />
            <ParserDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleParserSubmit}
                row={selectedRow}
            />
        </div>
    );
};
