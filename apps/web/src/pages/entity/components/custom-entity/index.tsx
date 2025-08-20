import { useState, useMemo, useCallback } from 'react';
import { Button, Stack, Menu, MenuItem } from '@mui/material';
import { useRequest } from 'ahooks';
import { pickBy } from 'lodash-es';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import {
    AddIcon,
    DeleteOutlineIcon,
    NoteAddIcon,
    toast,
    ErrorIcon,
} from '@milesight/shared/src/components';
import {
    TablePro,
    useConfirm,
    PermissionControlHidden,
    TableProProps,
    FilterValue,
    FiltersRecordType,
} from '@/components';
import { entityAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import { ENTITY_TYPE, PERMISSIONS } from '@/constants';
import { useUserPermissions } from '@/hooks';
import { useColumns, type UseColumnsProps, type TableRowDataType } from '../../hooks';
import AddModal from '../add-modal';
import AddFromWorkflow from '../add-from-workflow';

export default () => {
    const { getIntlText } = useI18n();
    const { hasPermission } = useUserPermissions();

    const [keyword, setKeyword] = useState<string>();
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [selectedIds, setSelectedIds] = useState<readonly ApiKey[]>([]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
    const [detail, setDetail] = useState<TableRowDataType | null>(null);
    const [isCopyAddEntity, setIsCopyAddEntity] = useState<boolean>(false);
    const [filteredInfo, setFilteredInfo] = useState<FiltersRecordType>({});

    const {
        data: entityData,
        loading,
        run: getList,
    } = useRequest(
        async () => {
            const { page, pageSize } = paginationModel;
            const searchParams = pickBy({
                entity_access_mod: filteredInfo?.entityAccessMod,
                entity_value_type: filteredInfo?.entityValueType,
            });
            const [error, resp] = await awaitWrap(
                entityAPI.getList({
                    keyword,
                    page_size: pageSize,
                    page_number: page + 1,
                    customized: true,
                    entity_type: [ENTITY_TYPE.PROPERTY],
                    ...searchParams,
                }),
            );
            const data = getResponseData(resp);

            if (error || !data || !isRequestSuccess(resp)) return;
            const camelData = objectToCamelCase(data);

            // Custom enums don't do camelCase conversions
            camelData.content.forEach((item, index) => {
                if (!item.entityValueAttribute) return;
                item.entityValueAttribute.enum = data.content[index].entity_value_attribute.enum;
            });

            return camelData;
        },
        {
            debounceWait: 300,
            refreshDeps: [keyword, paginationModel, filteredInfo],
        },
    );

    const confirm = useConfirm();
    const handleDeleteConfirm = useCallback(
        (ids?: ApiKey[]) => {
            const idsToDelete = ids || [...selectedIds];

            confirm({
                title: getIntlText('common.label.delete'),
                description: getIntlText('device.message.delete_tip'),
                confirmButtonText: getIntlText('common.label.delete'),
                icon: <ErrorIcon sx={{ color: 'var(--orange-base)' }} />,
                onConfirm: async () => {
                    const [error, resp] = await awaitWrap(
                        entityAPI.deleteEntities({ entity_ids: idsToDelete }),
                    );

                    if (error || !isRequestSuccess(resp)) return;

                    getList();
                    toast.success(getIntlText('common.message.delete_success'));
                },
            });
        },
        [confirm, getIntlText, getList, selectedIds],
    );

    const handleShowAddOnly = useCallback(() => {
        setIsCopyAddEntity(false);
        setModalOpen(true);
        setIsCopyAddEntity(false);
        setDetail(null);
        setAnchorEl(null);
    }, []);

    const handleFilterChange: TableProProps<TableRowDataType>['onFilterInfoChange'] = (
        filters: Record<string, FilterValue | null>,
    ) => {
        setFilteredInfo(filters);
    };

    const toolbarRender = useMemo(() => {
        return (
            <Stack className="ms-operations-btns" direction="row" spacing="12px">
                <PermissionControlHidden permissions={PERMISSIONS.ENTITY_CUSTOM_ADD}>
                    <Button
                        variant="contained"
                        className="md:d-none"
                        sx={{ height: 36, textTransform: 'none' }}
                        // aria-controls={open ? 'add-menu' : undefined}
                        // aria-haspopup="true"
                        // aria-expanded={open ? 'true' : undefined}
                        startIcon={<AddIcon />}
                        onClick={handleShowAddOnly}
                    >
                        {getIntlText('common.label.add')}
                    </Button>
                </PermissionControlHidden>
                <PermissionControlHidden permissions={PERMISSIONS.ENTITY_CUSTOM_DELETE}>
                    <Button
                        variant="outlined"
                        className="md:d-none"
                        disabled={!selectedIds.length}
                        sx={{ height: 36, textTransform: 'none' }}
                        startIcon={<DeleteOutlineIcon />}
                        onClick={() => handleDeleteConfirm()}
                    >
                        {getIntlText('common.label.delete')}
                    </Button>
                </PermissionControlHidden>
            </Stack>
        );
    }, [getIntlText, handleDeleteConfirm, selectedIds, handleShowAddOnly]);

    const handleTableBtnClick: UseColumnsProps<TableRowDataType>['onButtonClick'] = useCallback(
        (type, record) => {
            switch (type) {
                case 'edit': {
                    setDetail(record);
                    setIsCopyAddEntity(false);
                    setModalOpen(true);
                    break;
                }
                case 'copy': {
                    setDetail(record);
                    setIsCopyAddEntity(true);
                    setModalOpen(true);
                    break;
                }
                case 'delete': {
                    handleDeleteConfirm([record.entityId]);
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
        filteredInfo,
    });

    // const handleAddFromWorkflow = () => {
    //     setWorkflowModalOpen(true);
    //     handleClose();
    // };

    const handleSearch = useCallback((value: string) => {
        setKeyword(value);
        setPaginationModel(model => ({ ...model, page: 0 }));
    }, []);

    return (
        <div className="ms-main">
            <TablePro<TableRowDataType>
                filterCondition={[keyword, filteredInfo]}
                checkboxSelection={hasPermission(PERMISSIONS.ENTITY_CUSTOM_DELETE)}
                loading={loading}
                columns={columns}
                getRowId={record => record.entityId}
                rows={entityData?.content}
                rowCount={entityData?.total || 0}
                paginationModel={paginationModel}
                rowSelectionModel={selectedIds}
                // isRowSelectable={({ row }) => row.deletable}
                toolbarRender={toolbarRender}
                onPaginationModelChange={setPaginationModel}
                onRowSelectionModelChange={setSelectedIds}
                onSearch={handleSearch}
                onRefreshButtonClick={getList}
                onFilterInfoChange={handleFilterChange}
            />
            {modalOpen && (
                <AddModal
                    visible={modalOpen}
                    data={detail}
                    isCopyAddEntity={isCopyAddEntity}
                    onCancel={() => setModalOpen(false)}
                    onSuccess={() => {
                        getList();
                        setModalOpen(false);
                        if (detail) {
                            setSelectedIds([]);
                        }
                    }}
                />
            )}
            {workflowModalOpen && (
                <AddFromWorkflow
                    onCancel={() => setWorkflowModalOpen(false)}
                    onOk={() => {
                        getList();
                        setWorkflowModalOpen(false);
                    }}
                    data={detail}
                />
            )}
            <Menu
                id="add-menu"
                anchorEl={anchorEl}
                open={!!anchorEl}
                onClose={() => setAnchorEl(null)}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem
                    disabled
                    sx={{
                        '&.Mui-disabled': {
                            opacity: 1,
                        },
                    }}
                >
                    <div className="entity-add-menu-group-name">
                        {getIntlText('entity.label.create_property')}
                    </div>
                </MenuItem>
                <MenuItem onClick={handleShowAddOnly}>
                    <div className="entity-add-menu-item">
                        <NoteAddIcon className="entity-add-menu-item-icon" />
                        {getIntlText('entity.label.create_entity_only')}
                    </div>
                </MenuItem>
                {/* <MenuItem
                    disabled
                    sx={{
                        '&.Mui-disabled': {
                            opacity: 1,
                        },
                    }}
                >
                    <div className="entity-add-menu-group-name">
                        {getIntlText('entity.label.create_service')}
                    </div>
                </MenuItem>
                <MenuItem onClick={handleAddFromWorkflow}>
                    <div className="entity-add-menu-item">
                        <CalculateIcon className="entity-add-menu-item-icon" />
                        {getIntlText('entity.label.create_entity_from_workflow')}
                    </div>
                </MenuItem> */}
            </Menu>
        </div>
    );
};
