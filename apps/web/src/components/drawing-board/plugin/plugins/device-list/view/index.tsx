import React, { useMemo, useState, useContext } from 'react';
import { useRequest, useMemoizedFn } from 'ahooks';
import { isEmpty } from 'lodash-es';
import { Controller } from 'react-hook-form';
import cls from 'classnames';

import { useI18n, useTheme } from '@milesight/shared/src/hooks';
import { Modal } from '@milesight/shared/src/components';

import { type EntityFormDataProps } from '@/hooks';
import { TablePro } from '@/components';
import { deviceAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import { DrawingBoardContext } from '@/components/drawing-board/context';
import { DEVICE_STATUS_ENTITY_UNIQUE_ID } from '@/constants';
import { type DeviceListControlPanelConfig } from '../control-panel';
import { type BoardPluginProps } from '../../../types';
import { useStableValue } from '../../../hooks';
import { type TableRowDataType, useColumns, useDeviceEntities } from './hooks';
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
                const propertiesEntities = d?.important_entities?.filter(
                    e => e.type === 'PROPERTY',
                );
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
                    serviceEntities: d?.important_entities?.filter(e => e.type === 'SERVICE'),
                } as TableRowDataType;
            })
            .filter(
                d =>
                    (d.name || '')?.toLowerCase()?.includes(newKeyword) ||
                    String(d.identifier || '')
                        ?.toLowerCase()
                        ?.includes(newKeyword),
            );
    }, [data, keyword]);

    const toolbarRender = useMemo(() => {
        return (
            <div className="device-list-view__title">{getIntlText('device.title.device_list')}</div>
        );
    }, [getIntlText]);

    const handleSearch = useMemoizedFn((value: string) => {
        setKeyword(value);
    });

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
            handleDeviceDrawingBoard,
            handleServiceClick,
        };
    }, [keyword, newData, entitiesStatus, handleDeviceDrawingBoard, handleServiceClick]);

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
                    rows={newData}
                    toolbarRender={toolbarRender}
                    onSearch={handleSearch}
                />
            </div>
        );
    };

    return (
        <div className="device-list-view">
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
