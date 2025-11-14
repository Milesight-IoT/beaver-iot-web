import React, { useMemo, useContext, useRef, useState } from 'react';
import { useRequest } from 'ahooks';
import { isEmpty, isNil } from 'lodash-es';
import { Controller } from 'react-hook-form';
import cls from 'classnames';
import { GridRow } from '@mui/x-data-grid';

import { useI18n, useTheme } from '@milesight/shared/src/hooks';
import { Modal } from '@milesight/shared/src/components';

import { type EntityFormDataProps } from '@/hooks';
import { TablePro, HoverSearchInput, Tooltip } from '@/components';
import { deviceAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import { DrawingBoardContext } from '@/components/drawing-board/context';
import { DEVICE_STATUS_ENTITY_UNIQUE_ID } from '@/constants';
import { type DeviceListControlPanelConfig } from '../control-panel';
import { type BoardPluginProps } from '../../../types';
import { useStableValue } from '../../../hooks';
import {
    type TableRowDataType,
    noMoreDataRow,
    NO_MORE_DATA_SIGN,
    useColumns,
    useDeviceEntities,
} from './hooks';
import { MobileList } from './components';
import { DeviceListContext, type DeviceListContextProps } from './context';

import './style.less';

export interface DeviceListViewProps {
    config: DeviceListControlPanelConfig;
    configJson: BoardPluginProps;
}

const DeviceListView: React.FC<DeviceListViewProps> = props => {
    const { config, configJson } = props;
    const { devices: unStableDevices } = config || {};
    const { isPreview } = configJson || {};
    const context = useContext(DrawingBoardContext);
    const deviceListRef = useRef<HTMLDivElement>(null);
    const [keyword, setKeyword] = useState('');

    const { getIntlText } = useI18n();
    const { matchTablet } = useTheme();
    const { stableValue: devices } = useStableValue(unStableDevices);

    const { loading, data } = useRequest(
        async () => {
            if (!Array.isArray(devices) || isEmpty(devices)) {
                return;
            }

            const [error, resp] = await awaitWrap(
                deviceAPI.getList({
                    id_list: devices.map(d => d.id),
                    page_size: 100,
                    page_number: 1,
                }),
            );

            if (error || !isRequestSuccess(resp)) {
                return;
            }

            const result = getResponseData(resp);

            return result?.content || [];
        },
        {
            refreshDeps: [devices],
            debounceWait: 300,
        },
    );

    const newData = useMemo((): TableRowDataType[] => {
        if (!Array.isArray(data) || isEmpty(data)) {
            return [];
        }

        const newKeyword = (keyword || '')?.toLowerCase();

        return data
            .map(d => {
                const propertiesEntities = d?.important_entities
                    ?.filter(e => e.type === 'PROPERTY')
                    ?.sort((a, b) => {
                        const importantA = a?.value_attribute?.important;
                        const importantB = b?.value_attribute?.important;
                        if (isNil(importantA) || isNil(importantB)) {
                            return 0;
                        }

                        return importantA - importantB;
                    });
                const deviceStatusEntity = d?.common_entities?.find(c =>
                    c.key?.includes(DEVICE_STATUS_ENTITY_UNIQUE_ID),
                );

                return {
                    id: d.id,
                    name: d.name,
                    identifier: d.identifier,
                    deviceStatus: deviceStatusEntity,
                    propertyEntityFirst: propertiesEntities?.[0],
                    propertyEntitySecond: propertiesEntities?.[1],
                    serviceEntities: d?.important_entities
                        ?.filter(e => e.type === 'SERVICE')
                        ?.sort((a, b) => {
                            const importantA = a?.value_attribute?.important;
                            const importantB = b?.value_attribute?.important;
                            if (isNil(importantA) || isNil(importantB)) {
                                return 0;
                            }

                            return importantA - importantB;
                        }),
                } as TableRowDataType;
            })
            .filter(
                d =>
                    String(isNil(d?.name) ? '' : d.name)
                        ?.toLowerCase()
                        ?.includes(newKeyword) ||
                    String(isNil(d?.identifier) ? '' : d.identifier)?.toLowerCase() === newKeyword,
            );
    }, [data, keyword]);

    const toolbarRender = useMemo(() => {
        return (
            <div className="device-list-view__title">
                <Tooltip autoEllipsis title={getIntlText('device.title.device_list')} />
            </div>
        );
    }, [getIntlText]);

    const { entitiesStatus } = useDeviceEntities({
        isPreview,
        data,
    });
    const {
        columns,
        visible,
        formItems,
        control,
        modalTitle,
        loadingDeviceDrawingBoard,
        handleFormSubmit,
        handleSubmit,
        handleModalCancel,
        handleDeviceDrawingBoard,
        handleServiceClick,
    } = useColumns({
        isPreviewMode: isPreview,
        entitiesStatus,
    });

    const contextVal = useMemo((): DeviceListContextProps => {
        return {
            keyword,
            setKeyword,
            data: newData,
            entitiesStatus,
            loadingDeviceDrawingBoard,
            handleDeviceDrawingBoard,
            handleServiceClick,
        };
    }, [
        keyword,
        newData,
        entitiesStatus,
        loadingDeviceDrawingBoard,
        handleDeviceDrawingBoard,
        handleServiceClick,
        setKeyword,
    ]);

    /**
     * Add no more data row to last row
     */
    const tableData = useMemo(() => {
        if (!Array.isArray(newData) || isEmpty(newData)) {
            return [];
        }

        return [...newData, noMoreDataRow];
    }, [newData]);

    const renderContent = () => {
        if (matchTablet) {
            return (
                <DeviceListContext.Provider value={contextVal}>
                    <MobileList />
                </DeviceListContext.Provider>
            );
        }

        return (
            <div
                className={cls('device-list-view__table', {
                    fullscreenable: !(isPreview || context?.isEdit),
                })}
            >
                <TablePro<TableRowDataType>
                    loading={loading}
                    columns={columns}
                    pageSizeOptions={[100]}
                    paginationModel={{
                        page: 0,
                        pageSize: 100,
                    }}
                    paginationMode="client"
                    getRowId={row => row.id}
                    rows={tableData}
                    toolbarRender={toolbarRender}
                    searchSlot={<HoverSearchInput keyword={keyword} changeKeyword={setKeyword} />}
                    slots={{
                        // eslint-disable-next-line react/no-unstable-nested-components
                        row(props, otherProps) {
                            const newWidth = deviceListRef?.current?.getBoundingClientRect()?.width;

                            if (props?.rowId === NO_MORE_DATA_SIGN) {
                                return (
                                    <div
                                        key={props.rowId}
                                        className="device-list-view__no-data-tip border-top"
                                        style={{
                                            maxWidth:
                                                newWidth && newWidth > 32
                                                    ? `${newWidth - 32}px`
                                                    : undefined,
                                        }}
                                    >
                                        <div>{getIntlText('common.label.no_more_data')}</div>
                                    </div>
                                );
                            }

                            return <GridRow {...props} {...otherProps} />;
                        },
                    }}
                    sx={{
                        '.MuiDataGrid-filler > div': {
                            borderTop: 'none',
                        },
                    }}
                />
            </div>
        );
    };

    return (
        <div ref={deviceListRef} className="device-list-view">
            {renderContent()}
            {visible && (
                <Modal
                    visible
                    title={modalTitle || getIntlText('device.title.device_list')}
                    onOk={handleSubmit(handleFormSubmit)}
                    onCancel={handleModalCancel}
                >
                    {formItems.map(props => (
                        <Controller<EntityFormDataProps>
                            {...props}
                            key={props.name}
                            control={control}
                        />
                    ))}
                </Modal>
            )}
        </div>
    );
};

export default DeviceListView;
