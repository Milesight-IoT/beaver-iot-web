import React, { memo, useCallback, useState, useMemo, useRef } from 'react';
import { useRequest } from 'ahooks';
import { Button, Divider, Stack } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { IosShareIcon } from '@milesight/shared/src/components';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { useUserPermissions } from '@/hooks';
import {
    AdvancedFilter,
    AdvancedFilterHandler,
    PermissionControlHidden,
    TablePro,
    ToggleRadio,
    FILTER_OPERATORS,
} from '@/components';
import { ENTITY_TYPE, PERMISSIONS } from '@/constants';
import {
    entityAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    type EntityAPISchema,
    type DeviceAPISchema,
} from '@/services/http';
import useColumns, { type TableRowDataType, type UseColumnsProps } from './hooks/useColumns';
import { DetailModal, EditModal, ExportModal } from './components';

interface Props {
    data?: ObjectToCamelCase<DeviceAPISchema['getDetail']['response']>;

    /** The Table refresh button click callback */
    onRefresh?: () => void;
}

/**
 * Entity Data Module
 */
const EntityData: React.FC<Props> = memo(({ data: deviceDetail, onRefresh }) => {
    const { getIntlText } = useI18n();
    const { hasPermission } = useUserPermissions();
    const deviceId = deviceDetail?.id || '';

    // ---------- Toolbar Model ----------
    const [entityType, setEntityType] = useState<ENTITY_TYPE>(ENTITY_TYPE.PROPERTY);
    const advancedFilterRef = useRef<AdvancedFilterHandler>(null);
    const [advancedConditions, setAdvancedConditions] = useState<
        EntityAPISchema['advancedSearch']['request']['entity_filter']
    >({});

    // ---------- Table Model ----------
    const [detail, setDetail] = useState<TableRowDataType | null>(null);
    const [selectedIds, setSelectedIds] = useState<readonly ApiKey[]>([]);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

    // ---------- Modal Visible ----------
    const [exportVisible, setExportVisible] = useState<boolean>(false);
    const [detailVisible, setDetailVisible] = useState<boolean>(false);
    const [editVisible, setEditVisible] = useState<boolean>(false);

    // ---------- Search Entity List ----------
    const {
        data: entityData,
        loading,
        run: getEntityList,
    } = useRequest(
        async () => {
            if (!deviceId) return;

            const { page, pageSize } = paginationModel;
            const advancedFilter = { ...advancedConditions };

            advancedFilter.DEVICE_ID = { operator: 'EQ', values: [deviceId] };
            advancedFilter.ENTITY_TYPE = { operator: 'ANY_EQUALS', values: [entityType] };

            const [error, resp] = await awaitWrap(
                entityAPI.advancedSearch({
                    page_size: pageSize,
                    page_number: page + 1,
                    sorts: [
                        {
                            direction: 'ASC',
                            property: 'key',
                        },
                    ],
                    entity_filter: advancedFilter,
                }),
            );
            const data = getResponseData(resp);

            if (error || !data || !isRequestSuccess(resp)) return;
            const result = objectToCamelCase(data);

            result.content.forEach((entity, index) => {
                if (entity.entityValueAttribute?.enum) {
                    entity.entityValueAttribute.enum =
                        data.content[index].entity_value_attribute.enum;
                }
            });

            return result;
        },
        {
            debounceWait: 300,
            refreshDeps: [deviceId, paginationModel, entityType, advancedConditions],
        },
    );

    // ---------- Generate Table Columns ----------
    // Handle table operation button click
    const handleTableBtnClick: UseColumnsProps<TableRowDataType>['onButtonClick'] = useCallback(
        (type, record, tag) => {
            switch (type) {
                case 'detail': {
                    setDetail(record);
                    setDetailVisible(true);
                    break;
                }
                case 'edit': {
                    setDetail(record);
                    setEditVisible(true);
                    break;
                }
                case 'filter': {
                    advancedFilterRef.current?.appendConditionValue({
                        column: 'entityTags',
                        operator: FILTER_OPERATORS.ANY_EQUALS,
                        value: [
                            {
                                label: tag?.name || '',
                                value: tag?.name || '',
                            },
                        ],
                        valueCompType: 'select',
                    });
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
        entityType,
        onButtonClick: handleTableBtnClick,
    });

    // ---------- Render Toolbar ----------
    const handleAdvancedSearch = useCallback(
        (filters: AdvancedConditionsType<TableRowDataType>) => {
            setAdvancedConditions(filters);
            setPaginationModel(model => ({ ...model, page: 0 }));
        },
        [],
    );
    const toolbarRender = useMemo(() => {
        return (
            <Stack className="ms-operations-btns" direction="row" spacing="12px">
                <ToggleRadio
                    options={Object.entries(ENTITY_TYPE).map(([key]) => ({
                        label: key,
                        value: key,
                    }))}
                    value={entityType}
                    onChange={val => {
                        setEntityType(val as ENTITY_TYPE);
                        setPaginationModel(model => ({ ...model, page: 0 }));
                    }}
                    sx={{ height: 36, width: 'auto' }}
                />
                <PermissionControlHidden permissions={PERMISSIONS.DEVICE_VIEW}>
                    <Divider
                        orientation="vertical"
                        flexItem
                        className="md:d-none"
                        sx={{
                            width: '1px',
                            borderColor: 'var(--gray-color-3)',
                        }}
                    />
                    <Button
                        variant="outlined"
                        className="md:d-none"
                        sx={{ textTransform: 'none' }}
                        startIcon={<IosShareIcon />}
                        onClick={() => setExportVisible(true)}
                        disabled={!selectedIds.length}
                    >
                        {getIntlText('common.label.export')}
                    </Button>
                </PermissionControlHidden>
                <Divider
                    orientation="vertical"
                    flexItem
                    className="md:d-none"
                    sx={{
                        width: '1px',
                        borderColor: 'var(--gray-color-3)',
                    }}
                />
                <AdvancedFilter<TableRowDataType>
                    ref={advancedFilterRef}
                    columns={columns}
                    onChange={handleAdvancedSearch}
                    variant="outlined"
                    className="md:d-none"
                >
                    {getIntlText('entity.label.filter')}
                </AdvancedFilter>
            </Stack>
        );
    }, [columns, entityType, selectedIds.length, getIntlText, handleAdvancedSearch]);

    return (
        <Stack className="ms-com-device-entity" sx={{ height: '100%' }}>
            <TablePro<TableRowDataType>
                keepNonExistentRowsSelected
                tableName="device_entity_data"
                filterCondition={[advancedConditions, entityType]}
                checkboxSelection={hasPermission(PERMISSIONS.DEVICE_VIEW)}
                loading={loading}
                columns={columns}
                getRowId={record => record.entityId}
                rows={entityData?.content}
                rowCount={entityData?.total || 0}
                paginationModel={paginationModel}
                pageSizeOptions={[10, 20, 30, 40, 50, 100]}
                rowSelectionModel={selectedIds}
                toolbarRender={toolbarRender}
                onPaginationModelChange={setPaginationModel}
                onRowSelectionModelChange={setSelectedIds}
                onRefreshButtonClick={getEntityList}
            />
            <DetailModal
                detail={detail}
                visible={detailVisible}
                onCancel={() => {
                    setDetail(null);
                    setDetailVisible(false);
                }}
            />
            <EditModal
                data={detail}
                visible={editVisible}
                onCancel={() => {
                    setDetail(null);
                    setEditVisible(false);
                }}
                onSuccess={() => {
                    setDetail(null);
                    setEditVisible(false);
                    getEntityList();
                    setSelectedIds([]);
                }}
            />
            <ExportModal
                ids={selectedIds}
                visible={exportVisible}
                onCancel={() => setExportVisible(false)}
                onSuccess={() => {
                    setExportVisible(false);
                    setSelectedIds([]);
                }}
            />
        </Stack>
    );
});

export default EntityData;
