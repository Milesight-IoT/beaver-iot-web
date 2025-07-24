import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { Button, Stack } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { AddIcon, DeleteOutlineIcon, toast } from '@milesight/shared/src/components';
import { useConfirm, TablePro } from '@/components';
import {
    awaitWrap,
    isRequestSuccess,
    getResponseData,
    mqttApi,
    TemplateType,
    MqttBrokerInfoType,
    TemplateDetailType,
} from '@/services/http';
import { InteEntityType } from '../../../hooks';
import { TableRowDataType, useColumns, UseColumnsProps } from './hooks';
import { AddTemplate, TestTemplate } from './components';

interface Props {
    /** Entity list */
    entities?: InteEntityType[];
    brokerInfo?: MqttBrokerInfoType;
    /** Edit successful callback */
    onUpdateSuccess?: () => void;
}

/**
 * device template component
 */
const DeviceTemplate: React.FC<Props> = ({ entities, brokerInfo, onUpdateSuccess }) => {
    const { getIntlText } = useI18n();
    const navigate = useNavigate();
    const [addOpen, setAddOpen] = useState<boolean>(false);
    const [templateDetail, setTemplateDetail] = useState<
        ObjectToCamelCase<TemplateType | TemplateDetailType> | undefined
    >();
    const [testOpen, setTestOpen] = useState<boolean>(false);

    // ---------- list data related to ----------
    const [keyword, setKeyword] = useState<string>();
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [selectedIds, setSelectedIds] = useState<readonly ApiKey[]>([]);

    const {
        data: templateData,
        loading,
        run: getTemplateList,
    } = useRequest(
        async () => {
            const { page, pageSize } = paginationModel;
            const [error, resp] = await awaitWrap(
                mqttApi.getList({
                    page_number: page + 1,
                    page_size: pageSize,
                    name: keyword,
                }),
            );
            const data = getResponseData(resp);
            if (error || !data || !isRequestSuccess(resp)) {
                return;
            }
            return objectToCamelCase(data);
        },
        {
            debounceWait: 300,
            refreshDeps: [keyword, paginationModel],
        },
    );

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
                        ? getIntlText('setting.integration.bulk_del_template_desc', {
                              1: idsToDelete.length,
                          })
                        : getIntlText('setting.integration.del_template_desc'),
                confirmButtonText: getIntlText('common.label.delete'),
                type: 'warning',
                onConfirm: async () => {
                    const [error, resp] = await awaitWrap(
                        mqttApi.deleteTemplate({ id_list: idsToDelete }),
                    );

                    if (error || !isRequestSuccess(resp)) return;

                    getTemplateList();
                    setSelectedIds([]);
                    onUpdateSuccess?.();
                    toast.success(getIntlText('common.message.delete_success'));
                },
            });
        },
        [confirm, getIntlText, getTemplateList, selectedIds],
    );

    const handleAddTemplate = () => {
        setTemplateDetail(undefined);
        setAddOpen(true);
    };

    const handleEditTemplate = async (template: TableRowDataType) => {
        setTemplateDetail(template);
        setAddOpen(true);
    };

    const handleTestData = async (template: TableRowDataType) => {
        const [error, resp] = await awaitWrap(
            mqttApi.getTemplateDetail({
                id: template.id,
            }),
        );
        const data = getResponseData(resp);
        if (error || !data || !isRequestSuccess(resp)) {
            return;
        }
        setTemplateDetail(objectToCamelCase(data));
        setTestOpen(true);
    };

    // quick search device with the same type of template
    const handleSearchDevice = (template: TableRowDataType) => {
        navigate(`/device?template_key=${template.key}`);
    };

    // ---------- Table rendering related to ----------
    const toolbarRender = useMemo(() => {
        return (
            <Stack className="ms-operations-btns" direction="row" spacing="12px">
                <Button
                    variant="contained"
                    sx={{ textTransform: 'none' }}
                    startIcon={<AddIcon />}
                    onClick={handleAddTemplate}
                >
                    {getIntlText('common.label.add')}
                </Button>
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
                case 'count': {
                    handleSearchDevice(record);
                    break;
                }
                case 'edit': {
                    handleEditTemplate(record);
                    break;
                }
                case 'test': {
                    handleTestData(record);
                    break;
                }
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

    const columns = useColumns<TableRowDataType>({
        onButtonClick: handleTableBtnClick,
        searchByTemplate: handleSearchDevice,
    });

    return (
        <div className="ms-view ms-view-mqtt-template">
            <div className="ms-view-inner">
                <TablePro<TableRowDataType>
                    checkboxSelection
                    getRowId={(row: TableRowDataType) => row.id}
                    loading={loading}
                    columns={columns}
                    rows={templateData?.content}
                    rowCount={templateData?.total || 0}
                    paginationModel={paginationModel}
                    rowSelectionModel={selectedIds}
                    toolbarRender={toolbarRender}
                    onPaginationModelChange={setPaginationModel}
                    onRowSelectionModelChange={setSelectedIds}
                    onSearch={value => {
                        setKeyword(value);
                        setPaginationModel(model => ({ ...model, page: 0 }));
                    }}
                    onRefreshButtonClick={getTemplateList}
                />
            </div>
            {addOpen && (
                <AddTemplate
                    visible={addOpen}
                    template={templateDetail}
                    entities={entities}
                    brokerInfo={brokerInfo}
                    onCancel={() => {
                        setAddOpen(false);
                        setTemplateDetail(undefined);
                    }}
                    refreshTable={getTemplateList}
                />
            )}
            {testOpen && !!templateDetail && (
                <TestTemplate
                    visible={testOpen}
                    templateDetail={templateDetail as ObjectToCamelCase<TemplateDetailType>}
                    onCancel={() => {
                        setTestOpen(false);
                        setTemplateDetail(undefined);
                    }}
                    refreshTable={getTemplateList}
                />
            )}
        </div>
    );
};

export default DeviceTemplate;
