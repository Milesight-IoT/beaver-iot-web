import { useMemo, useState } from 'react';
import { useRequest } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { Modal } from '@milesight/shared/src/components';
import {
    Descriptions,
    FiltersRecordType,
    FilterValue,
    MultiTag,
    TablePro,
    TableProProps,
    Tag,
} from '@/components';
import {
    entityAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    DeviceAPISchema,
} from '@/services/http';
import { type HistoryRowDataType, useColumns } from './hooks';

interface IProps {
    detail: ObjectToCamelCase<DeviceAPISchema['getDetail']['response']['entities'][0]>;
    onCancel: () => void;
}

type EntityTagType = NonNullable<
    ObjectToCamelCase<DeviceAPISchema['getDetail']['response']['entities'][0]>['entityTags']
>[0];

export default (props: IProps) => {
    const { getIntlText } = useI18n();
    const { detail, onCancel } = props;
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [filteredInfo, setFilteredInfo] = useState<FiltersRecordType>({});

    const {
        data: entityData,
        loading,
        run: getList,
    } = useRequest(
        async () => {
            const { page, pageSize } = paginationModel;
            const { timestamp } = filteredInfo;
            const [error, resp] = await awaitWrap(
                entityAPI.getHistory({
                    entity_id: detail.id,
                    start_timestamp: (timestamp?.[0] as any)?.start
                        ? (timestamp?.[0] as any)?.start.valueOf()
                        : undefined,
                    end_timestamp: (timestamp?.[0] as any)?.end
                        ? ((timestamp?.[0] as any)?.end.valueOf() || 0) + 86399000
                        : undefined, // Adding 86399000 manually here is to ensure the end time is 23:59:59.
                    page_size: pageSize,
                    page_number: page + 1,
                }),
            );
            const data = getResponseData(resp);

            if (error || !data || !isRequestSuccess(resp)) return;
            return objectToCamelCase(data);
        },
        {
            debounceWait: 300,
            refreshDeps: [paginationModel, filteredInfo],
        },
    );

    // filter info change
    const handleFilterChange: TableProProps<HistoryRowDataType>['onFilterInfoChange'] = (
        filters: Record<string, FilterValue | null>,
    ) => {
        setFilteredInfo(filters);
    };

    const columns = useColumns<HistoryRowDataType>({
        filteredInfo,
        detail,
    });

    const entityInfo = useMemo(() => {
        return [
            {
                key: 'name',
                label: getIntlText('device.label.param_entity_name'),
                content: detail.name,
            },
            {
                key: 'dataType',
                label: getIntlText('common.label.type'),
                content: detail.valueType,
            },
            {
                key: 'entityTags',
                label: getIntlText('tag.label.tags'),
                content: (
                    <MultiTag<EntityTagType>
                        data={(detail.entityTags || []).map((tag: EntityTagType) => ({
                            ...tag,
                            key: tag.id,
                            label: tag.name,
                            desc: tag.description,
                        }))}
                        renderItem={(tag, maxItemWidth) => {
                            return (
                                <Tag
                                    key={tag.id}
                                    label={tag.name}
                                    arbitraryColor={tag.color}
                                    tip={tag.description}
                                    sx={{ maxWidth: maxItemWidth }}
                                />
                            );
                        }}
                    />
                ),
                contentCellProps: {
                    colSpan: 3,
                },
            },
        ];
    }, [detail]);

    return (
        <Modal
            visible
            showCloseIcon
            onCancel={onCancel}
            footer={null}
            title={getIntlText('common.label.detail')}
            width="900px"
            sx={{
                '& .MuiDialogContent-root': {
                    height: '700px',
                },
            }}
        >
            <div className="ms-device-entity-data">
                <Descriptions data={entityInfo} />
                <div className="ms-device-entity-data-header">
                    <div>{getIntlText('entity.label.historical_data')}</div>
                </div>
                <div className="ms-device-entity-data-table">
                    <TablePro<HistoryRowDataType>
                        loading={loading}
                        columns={columns}
                        getRowId={record => record.id || record.timestamp}
                        rows={entityData?.content}
                        rowCount={entityData?.total || 0}
                        paginationModel={paginationModel}
                        toolbarRender={false}
                        onPaginationModelChange={setPaginationModel}
                        onRefreshButtonClick={getList}
                        onFilterInfoChange={handleFilterChange}
                    />
                </div>
            </div>
        </Modal>
    );
};
