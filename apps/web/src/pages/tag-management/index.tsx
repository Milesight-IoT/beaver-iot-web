import React, { useState, useMemo, useCallback } from 'react';
import { useRequest, useMemoizedFn } from 'ahooks';

import { Button, Stack } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { AddIcon, DeleteOutlineIcon } from '@milesight/shared/src/components';
import { TablePro, Breadcrumbs, Tooltip, PermissionControlHidden } from '@/components';
import { tagAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import { PERMISSIONS } from '@/constants';
import { useUserPermissions } from '@/hooks';
import { OperateTagModal } from './components';

import {
    useColumns,
    type UseColumnsProps,
    type TableRowDataType,
    useTagModal,
    useTag,
} from './hooks';

import './style.less';

/**
 * A user can create up to 300 tags.
 */
const USER_MAX_TAGS = 300;

const TagManagement: React.FC = () => {
    const { getIntlText } = useI18n();
    const { hasPermission } = useUserPermissions();

    // ---------- Tag list ----------
    const [keyword, setKeyword] = useState<string>('');
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [selectedIds, setSelectedIds] = useState<readonly ApiKey[]>([]);

    const handleSearch = useCallback((value: string) => {
        setKeyword(value);
        setPaginationModel(model => ({ ...model, page: 0 }));
    }, []);

    const {
        data: allTags,
        loading,
        run: getAllTags,
    } = useRequest(
        async () => {
            const { page, pageSize } = paginationModel;
            const [error, resp] = await awaitWrap(
                tagAPI.getTagList({
                    keyword,
                    page_size: pageSize,
                    page_number: page + 1,
                }),
            );
            const respData = getResponseData(resp);

            if (error || !respData || !isRequestSuccess(resp)) return;

            return objectToCamelCase(respData);
        },
        {
            debounceWait: 300,
            refreshDeps: [keyword, paginationModel],
        },
    );

    const { handleDeleteTag, getAddedTag, addedTagCount } = useTag(getAllTags);

    const {
        tagModalVisible,
        openAddTag,
        openEditTag,
        onFormSubmit,
        hideModal,
        operateType,
        modalTitle,
        currentTag,
    } = useTagModal(getAllTags, getAddedTag);

    // ---------- Table render bar ----------
    const toolbarRender = useMemo(() => {
        const isAddedExceed = addedTagCount >= USER_MAX_TAGS;
        return (
            <Stack className="ms-operations-btns" direction="row" spacing="12px">
                <PermissionControlHidden permissions={PERMISSIONS.TAG_MODULE_MANAGE}>
                    <Tooltip
                        isDisabledButton={isAddedExceed}
                        title={
                            isAddedExceed ? getIntlText('common.tip.maximum_number_reached') : null
                        }
                    >
                        <Button
                            disabled={isAddedExceed}
                            variant="contained"
                            sx={{ height: 36, textTransform: 'none' }}
                            startIcon={<AddIcon />}
                            onClick={openAddTag}
                        >
                            {getIntlText('common.label.add')}
                        </Button>
                    </Tooltip>
                </PermissionControlHidden>
                <PermissionControlHidden permissions={PERMISSIONS.TAG_MODULE_MANAGE}>
                    <Button
                        variant="outlined"
                        className="md:d-none"
                        disabled={!selectedIds.length}
                        sx={{ height: 36, textTransform: 'none' }}
                        startIcon={<DeleteOutlineIcon />}
                        onClick={() => {
                            handleDeleteTag(
                                (allTags?.content || []).filter(t =>
                                    Boolean(selectedIds?.includes(t.id)),
                                ),
                            );
                        }}
                    >
                        {getIntlText('common.label.delete')}
                    </Button>
                </PermissionControlHidden>
            </Stack>
        );
    }, [getIntlText, selectedIds, openAddTag, handleDeleteTag, allTags, addedTagCount]);

    const handleTableBtnClick: UseColumnsProps<TableRowDataType>['onButtonClick'] = useMemoizedFn(
        (type, record) => {
            switch (type) {
                case 'edit': {
                    openEditTag(record);
                    break;
                }
                case 'delete': {
                    handleDeleteTag([record]);
                    break;
                }
                default: {
                    break;
                }
            }
        },
    );

    const columns = useColumns<TableRowDataType>({ onButtonClick: handleTableBtnClick });

    return (
        <div className="ms-main">
            <Breadcrumbs />
            <div className="ms-view ms-view-tag">
                <div className="ms-view__inner">
                    <TablePro<TableRowDataType>
                        checkboxSelection={hasPermission(PERMISSIONS.TAG_MODULE_MANAGE)}
                        filterCondition={[keyword]}
                        loading={loading}
                        columns={columns}
                        getRowId={row => row.id}
                        rows={allTags?.content}
                        rowCount={allTags?.total || 0}
                        paginationModel={paginationModel}
                        rowSelectionModel={selectedIds}
                        toolbarRender={toolbarRender}
                        onPaginationModelChange={setPaginationModel}
                        onRowSelectionModelChange={setSelectedIds}
                        onSearch={handleSearch}
                        onRefreshButtonClick={getAllTags}
                    />
                    {tagModalVisible && (
                        <OperateTagModal
                            data={currentTag}
                            title={modalTitle}
                            operateType={operateType}
                            visible={tagModalVisible}
                            onCancel={hideModal}
                            onSuccess={operateType => {
                                operateType !== 'add' && setSelectedIds([]);
                            }}
                            onFormSubmit={onFormSubmit}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default TagManagement;
