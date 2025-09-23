import React, { useMemo, useState } from 'react';
import { useRequest, useMemoizedFn } from 'ahooks';
import { isEmpty } from 'lodash-es';
import { Controller } from 'react-hook-form';

import { useI18n } from '@milesight/shared/src/hooks';
import { Modal } from '@milesight/shared/src/components';

import { type EntityFormDataProps } from '@/hooks';
import { TablePro } from '@/components';
import { deviceAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import { type DeviceListControlPanelConfig } from '../control-panel';
import { type BoardPluginProps } from '../../../types';
import { useStableValue } from '../../../hooks';
import { type TableRowDataType, useColumns, useDeviceEntities } from './hooks';

import './style.less';

export interface DeviceListViewProps {
    config: DeviceListControlPanelConfig;
    pluginProps: BoardPluginProps;
}

const DeviceListView: React.FC<DeviceListViewProps> = props => {
    const { config, pluginProps } = props;
    const { devices: unStableDevices } = config || {};
    const { isPreview } = pluginProps || {};

    const [keyword, setKeyword] = useState('');

    const { getIntlText } = useI18n();
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
                const propertiesEntity = d?.important_entities?.filter(e => e.type === 'PROPERTY');

                return {
                    id: d.id,
                    name: d.name,
                    identifier: d.identifier,
                    propertyEntityFirst: propertiesEntity?.[0],
                    propertyEntitySecond: propertiesEntity?.[1],
                    serviceEntities: d?.important_entities?.filter(e => e.type === 'SERVICE'),
                };
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
    } = useColumns({
        isPreviewMode: isPreview,
        entitiesStatus,
    });

    return (
        <div className="device-list-view">
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
