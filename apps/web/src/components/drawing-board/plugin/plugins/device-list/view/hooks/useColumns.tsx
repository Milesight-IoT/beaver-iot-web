import { useMemo } from 'react';
import { Stack, IconButton } from '@mui/material';
import { useMemoizedFn } from 'ahooks';
import { get, isNil } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';
import { SettingsIcon, SpaceDashboardIcon, LoadingWrapper } from '@milesight/shared/src/components';

import { Tooltip, DeviceStatus, type ColumnType } from '@/components';
import { type ImportEntityProps, type EntityAPISchema } from '@/services/http';
import { useDeviceDrawingBoard } from './useDeviceDrawingBoard';
import { useCallService } from './useCallService';

export type TableRowDataType = {
    id: ApiKey;
    name: string;
    identifier: ApiKey;
    deviceStatus?: ImportEntityProps;
    propertyEntityFirst?: ImportEntityProps;
    propertyEntitySecond?: ImportEntityProps;
    serviceEntities?: ImportEntityProps[];
};

/**
 * Show no more data row
 */
export const NO_MORE_DATA_SIGN = 'TABLE_NO_MORE_DATA_ROW';
export const noMoreDataRow: TableRowDataType = {
    id: NO_MORE_DATA_SIGN,
    name: NO_MORE_DATA_SIGN,
    identifier: NO_MORE_DATA_SIGN,
};

export interface UseColumnsProps {
    /**
     * Is preview mode
     */
    isPreviewMode?: boolean;
    /**
     * Current devices all entities status
     */
    entitiesStatus?: EntityAPISchema['getEntitiesStatus']['response'];
}

const useColumns = <T extends TableRowDataType>({
    isPreviewMode,
    entitiesStatus,
}: UseColumnsProps) => {
    const { getIntlText } = useI18n();
    const { loading: loadingDeviceDrawingBoard, handleDeviceDrawingBoard } =
        useDeviceDrawingBoard(isPreviewMode);
    const {
        visible,
        control,
        formItems,
        modalTitle,
        handleServiceClick,
        handleSubmit,
        handleFormSubmit,
        handleModalCancel,
    } = useCallService(isPreviewMode);

    /**
     * Get entity display name: status
     */
    const entityNameAndStatus = useMemoizedFn((entity?: ImportEntityProps) => {
        if (!entity) {
            return '-';
        }

        const status = get(entitiesStatus, entity?.id || '');
        if (!status || isNil(status?.value)) {
            return `${entity.name}: -`;
        }

        return `${entity.name}: ${status.value}${entity?.value_attribute?.unit || ''}`;
    });

    const columns: ColumnType<T>[] = useMemo(() => {
        return [
            {
                field: 'name',
                headerName: getIntlText('device.label.param_device_name'),
                flex: 1,
                minWidth: 100,
                ellipsis: true,
            },
            {
                field: 'identifier',
                headerName: getIntlText('device.label.param_external_id'),
                ellipsis: true,
                flex: 1,
                minWidth: 80,
            },
            {
                field: 'deviceStatus',
                headerName: getIntlText('device.title.device_status'),
                ellipsis: true,
                flex: 1,
                minWidth: 110,
                renderCell({ row }) {
                    const status = get(entitiesStatus, row?.deviceStatus?.id || '');
                    return <DeviceStatus type={status?.value} />;
                },
            },
            {
                field: 'propertyEntityFirst',
                headerName: getIntlText('entity.label.property_entity_first'),
                flex: 1,
                minWidth: 100,
                ellipsis: true,
                renderCell({ row }) {
                    return entityNameAndStatus(row?.propertyEntityFirst);
                },
            },
            {
                field: 'propertyEntitySecond',
                headerName: getIntlText('entity.label.property_entity_second'),
                flex: 1,
                minWidth: 100,
                ellipsis: true,
                renderCell({ row }) {
                    return entityNameAndStatus(row?.propertyEntitySecond);
                },
            },
            {
                field: '$operation',
                headerName: getIntlText('common.label.operation'),
                display: 'flex',
                width: 120,
                align: 'left',
                headerAlign: 'left',
                fixed: 'right',
                renderCell({ row }) {
                    return (
                        <Stack
                            direction="row"
                            spacing="4px"
                            sx={{ height: '100%', alignItems: 'center', justifyContent: 'end' }}
                        >
                            <Tooltip
                                title={
                                    row?.serviceEntities?.[0]?.name ||
                                    getIntlText('workflow.label.service_node_name')
                                }
                            >
                                <IconButton
                                    sx={{ width: 30, height: 30 }}
                                    onClick={() => {
                                        handleServiceClick(row?.serviceEntities?.[0]);
                                    }}
                                >
                                    <SettingsIcon sx={{ width: 20, height: 20 }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip
                                title={
                                    row?.serviceEntities?.[1]?.name ||
                                    getIntlText('workflow.label.service_node_name')
                                }
                            >
                                <IconButton
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        color: 'text.secondary',
                                    }}
                                    onClick={() => {
                                        handleServiceClick(row?.serviceEntities?.[1]);
                                    }}
                                >
                                    <SettingsIcon sx={{ width: 20, height: 20 }} />
                                </IconButton>
                            </Tooltip>
                            <LoadingWrapper
                                size={24}
                                loading={get(
                                    loadingDeviceDrawingBoard,
                                    String(row?.id || ''),
                                    false,
                                )}
                            >
                                <Tooltip title={getIntlText('common.label.detail')}>
                                    <IconButton
                                        sx={{
                                            width: 30,
                                            height: 30,
                                            color: 'text.secondary',
                                        }}
                                        onClick={() => handleDeviceDrawingBoard(row?.id)}
                                    >
                                        <SpaceDashboardIcon sx={{ width: 20, height: 20 }} />
                                    </IconButton>
                                </Tooltip>
                            </LoadingWrapper>
                        </Stack>
                    );
                },
            },
        ];
    }, [
        getIntlText,
        handleDeviceDrawingBoard,
        handleServiceClick,
        entityNameAndStatus,
        loadingDeviceDrawingBoard,
        entitiesStatus,
    ]);

    return {
        columns,
        visible,
        control,
        formItems,
        modalTitle,
        loadingDeviceDrawingBoard,
        handleSubmit,
        handleFormSubmit,
        handleModalCancel,
        handleDeviceDrawingBoard,
        handleServiceClick,
    };
};

export default useColumns;
