import { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Divider, Stack } from '@mui/material';
import { useRequest } from 'ahooks';
import { pickBy } from 'lodash-es';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import { genRandomString, objectToCamelCase, xhrDownload } from '@milesight/shared/src/utils/tools';
import { getCurrentComponentLang } from '@milesight/shared/src/services/i18n';
import { getAuthorizationToken } from '@milesight/shared/src/utils/request/utils';
import { IosShareIcon, toast, SellOutlinedIcon } from '@milesight/shared/src/components';
import {
    FiltersRecordType,
    TablePro,
    PermissionControlHidden,
    FilterValue,
    TableProProps,
    ManageTagsModal,
    AdvancedFilter,
    AdvancedFilterHandler,
    FILTER_OPERATORS,
    ToggleRadio,
    ColumnSettingProps,
} from '@/components';
import { DateRangePickerValueType } from '@/components/date-range-picker';
import { useManageTagsModal } from '@/components/manage-tags-modal/hooks';
import {
    entityAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    API_PREFIX,
} from '@/services/http';
import { ENTITY_TYPE, PERMISSIONS } from '@/constants';
import { useUserPermissions } from '@/hooks';
import errorHandler from '@/services/http/client/error-handler';
import useColumns, {
    type UseColumnsProps,
    type TableRowDataType,
} from '../../hooks/useEntityColumns';
import Detail from '../detail';
import EditEntity from '../edit-entity';
import ExportModal from '../export-modal';

export default () => {
    const navigate = useNavigate();
    const { getIntlText } = useI18n();
    const { getTimeFormat, dayjs } = useTime();
    const { hasPermission } = useUserPermissions();
    // Advanced filter
    const advancedFilterRef = useRef<AdvancedFilterHandler>(null);
    const [entityType, setEntityType] = useState<ENTITY_TYPE>(ENTITY_TYPE.PROPERTY);
    const [advancedConditions, setAdvancedConditions] = useState<
        AdvancedConditionsType<TableRowDataType>
    >({});

    const [keyword, setKeyword] = useState<string>();
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [selectedIds, setSelectedIds] = useState<readonly ApiKey[]>([]);
    const [exportVisible, setExportVisible] = useState<boolean>(false);
    const [detail, setDetail] = useState<TableRowDataType | null>(null);
    const [detailVisible, setDetailVisible] = useState<boolean>(false);
    const [editVisible, setEditVisible] = useState<boolean>(false);
    const [filteredInfo, setFilteredInfo] = useState<FiltersRecordType>({});
    const [allEntities, setAllEntities] = useState<Record<ApiKey, TableRowDataType>>({});

    const {
        data: entityData,
        loading,
        run: getList,
    } = useRequest(
        async () => {
            const { page, pageSize } = paginationModel;
            const advancedFilter = { ...advancedConditions };
            advancedFilter['ENTITY_TYPE' as keyof AdvancedConditionsType<TableRowDataType>] = {
                operator: 'ANY_EQUALS',
                values: [entityType],
            };
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

                allEntities[entity.entityId] = entity;
            });
            return result;
        },
        {
            debounceWait: 300,
            refreshDeps: [paginationModel, entityType, advancedConditions],
        },
    );

    const {
        manageTagsModalVisible,
        openManageTagsModalAtEntity,
        closeManageTagsModal,
        manageTagsFormSubmit,
        selectedEntities,
    } = useManageTagsModal(getList, () => {
        setSelectedIds([]);
    });

    const handleFilterChange: TableProProps<TableRowDataType>['onFilterInfoChange'] = (
        filters: Record<string, FilterValue | null>,
    ) => {
        setFilteredInfo(filters);
    };

    const handleShowExport = () => {
        if (!selectedIds?.length) {
            toast.error(
                getIntlText('valid.resp.at_least_one', { 1: getIntlText('common.label.entity') }),
            );
            return;
        }
        setExportVisible(true);
    };

    const handleCloseExport = () => {
        setExportVisible(false);
    };

    const handleExportConfirm = async (time: DateRangePickerValueType | null) => {
        if (!selectedIds?.length) {
            return;
        }
        let url = `${API_PREFIX}/entity/export?`;
        selectedIds.forEach((id: ApiKey) => {
            url += `&ids=${id}`;
        });
        if (time?.start) {
            url += `&start_timestamp=${time?.start.valueOf()}`;
        }
        if (time?.end) {
            url += `&end_timestamp=${time?.end.valueOf() || 0}`;
        }
        url += `&timeZone=${encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone)}`;
        xhrDownload({
            assets: url,
            fileName: `EntityData_${getTimeFormat(dayjs(), 'simpleDateFormat').replace(
                /-/g,
                '_',
            )}_${genRandomString(6, { upperCase: false, lowerCase: true })}.csv`,
            header: {
                'Accept-Language': getCurrentComponentLang(),
                Authorization: getAuthorizationToken(),
            },
        })
            .then(() => {
                refreshListByOperator();
                handleCloseExport();
                toast.success(getIntlText('common.message.operation_success'));
            })
            .catch(error => {
                /**
                 * Handle blob errors
                 * Convert to string message alert
                 */
                error?.response?.data?.text()?.then((errorStr: string) => {
                    if (!errorStr || typeof errorStr !== 'string') return;

                    const errorObj = JSON.parse(errorStr);
                    if (!errorObj?.error_code) return;

                    errorHandler?.(errorObj?.error_code, error);
                });
            });
    };

    /** Details event related */
    const handleDetail = (data: TableRowDataType) => {
        setDetail(data);
        setDetailVisible(true);
    };

    const handleDetailClose = () => {
        setDetailVisible(false);
        setDetail(null);
    };

    /** Edit event related */
    const showEdit = (data: TableRowDataType) => {
        setDetail(data);
        setEditVisible(true);
    };

    const handleEditClose = () => {
        setEditVisible(false);
        setDetail(null);
    };

    // Operator then reset selected
    const refreshListByOperator = () => {
        getList();
        setSelectedIds([]);
    };

    const handleEdit = async (name: string) => {
        const [error, resp] = await awaitWrap(
            entityAPI.editEntity({ name, id: detail?.entityId || '' }),
        );

        if (error || !isRequestSuccess(resp)) return;

        setEditVisible(false);
        refreshListByOperator();
        setDetail(null);
        toast.success(getIntlText('common.message.operation_success'));
    };

    // Filter by click tag
    const handleFilterByTag = (tag?: NonNullable<TableRowDataType['entityTags']>[0]) => {
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
    };

    const handleTableBtnClick: UseColumnsProps<TableRowDataType>['onButtonClick'] = useCallback(
        (type, record, tag) => {
            switch (type) {
                case 'detail': {
                    handleDetail(record);
                    break;
                }
                case 'edit': {
                    showEdit(record);
                    break;
                }
                case 'filter': {
                    handleFilterByTag(tag);
                    break;
                }
                default: {
                    break;
                }
            }
        },
        [navigate, handleExportConfirm],
    );
    const columns = useColumns<TableRowDataType>({
        onButtonClick: handleTableBtnClick,
        filteredInfo,
    });
    const handleAdvancedSearch = useCallback(
        (filters: AdvancedConditionsType<TableRowDataType>) => {
            setAdvancedConditions(filters);
            setPaginationModel(model => ({ ...model, page: 0 }));
        },
        [],
    );

    const handleSearch = useCallback((value: string) => {
        setKeyword(value);
        setPaginationModel(model => ({ ...model, page: 0 }));
    }, []);

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
                <Divider
                    orientation="vertical"
                    flexItem
                    className="md:d-none"
                    sx={{
                        width: '1px',
                        borderColor: 'var(--gray-color-3)',
                    }}
                />
                <PermissionControlHidden permissions={PERMISSIONS.ENTITY_DATA_EDIT}>
                    <Button
                        disabled={!selectedIds.length}
                        variant="outlined"
                        className="md:d-none"
                        sx={{ height: 36, textTransform: 'none' }}
                        startIcon={<SellOutlinedIcon />}
                        onClick={() =>
                            openManageTagsModalAtEntity(Object.values(allEntities), selectedIds)
                        }
                    >
                        {getIntlText('tag.label.tags')}
                    </Button>
                </PermissionControlHidden>
                <PermissionControlHidden permissions={PERMISSIONS.ENTITY_DATA_VIEW}>
                    <Button
                        variant="outlined"
                        className="md:d-none"
                        sx={{ textTransform: 'none' }}
                        startIcon={<IosShareIcon />}
                        onClick={handleShowExport}
                        disabled={!selectedIds.length}
                    >
                        {getIntlText('common.label.export')}
                    </Button>
                </PermissionControlHidden>
                <PermissionControlHidden
                    permissions={[PERMISSIONS.ENTITY_DATA_VIEW, PERMISSIONS.ENTITY_DATA_EDIT]}
                >
                    <Divider
                        orientation="vertical"
                        flexItem
                        className="md:d-none"
                        sx={{
                            width: '1px',
                            borderColor: 'var(--gray-color-3)',
                        }}
                    />
                </PermissionControlHidden>
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
    }, [getIntlText, handleExportConfirm, selectedIds, openManageTagsModalAtEntity, entityData]);

    return (
        <div className="ms-main">
            <TablePro<TableRowDataType>
                keepNonExistentRowsSelected
                filterCondition={[advancedConditions, entityType]}
                tableName="entity_data"
                columnSetting
                checkboxSelection={hasPermission([
                    PERMISSIONS.ENTITY_DATA_VIEW,
                    PERMISSIONS.ENTITY_DATA_EDIT,
                ])}
                loading={loading}
                columns={columns}
                getRowId={record => record.entityId}
                rows={entityData?.content}
                rowCount={entityData?.total || 0}
                paginationModel={paginationModel}
                pageSizeOptions={[10, 20, 30, 40, 50, 100]}
                rowSelectionModel={selectedIds}
                // isRowSelectable={({ row }) => row.deletable}
                toolbarRender={toolbarRender}
                onPaginationModelChange={setPaginationModel}
                onRowSelectionModelChange={setSelectedIds}
                // onSearch={handleSearch}
                onRefreshButtonClick={getList}
                onFilterInfoChange={handleFilterChange}
                filterSettingColumns={(settingColumns: ColumnSettingProps<TableRowDataType>[]) => {
                    return entityType !== ENTITY_TYPE.PROPERTY
                        ? settingColumns.filter(col => col.field !== 'entityLatestValue')
                        : settingColumns;
                }}
            />
            {!!detailVisible && !!detail && <Detail onCancel={handleDetailClose} detail={detail} />}
            {!!editVisible && !!detail && (
                <EditEntity onCancel={handleEditClose} onOk={handleEdit} data={detail} />
            )}
            {!!exportVisible && (
                <ExportModal onCancel={handleCloseExport} onOk={handleExportConfirm} />
            )}
            {manageTagsModalVisible && (
                <ManageTagsModal
                    visible={manageTagsModalVisible}
                    onCancel={closeManageTagsModal}
                    onFormSubmit={manageTagsFormSubmit}
                    selectedEntities={selectedEntities}
                    tip={getIntlText('tag.tip.selected_entities_contain_follow_tags', {
                        1: selectedIds?.length || 0,
                    })}
                />
            )}
        </div>
    );
};
