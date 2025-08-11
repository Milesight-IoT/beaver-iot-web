import { useState } from 'react';
import { useMemoizedFn } from 'ahooks';
import { isEmpty } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';
import { toast } from '@milesight/shared/src/components';

import {
    deviceAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    type AddDeviceProps,
} from '@/services/http';
import { type BatchAddProps, type BatchAddStatus } from '../components/batch-add-modal';
import { type DeviceGroupExposeProps } from '../components/device-group';

export default function useBatchAddModal(
    deviceGroupRef: React.RefObject<DeviceGroupExposeProps>,
    getDevices?: () => void,
) {
    const { getIntlText } = useI18n();

    const [batchAddModalVisible, setBatchAddModalVisible] = useState(false);
    const [batchAddStatus, setBatchAddStatus] = useState<BatchAddStatus>('beforeAdd');
    const [addList, setAddList] = useState<AddDeviceProps[]>([]);
    const [integration, setIntegration] = useState<ApiKey>();
    const [templateFile, setTemplateFile] = useState<File>();
    const [rowIds, setRowIds] = useState<ApiKey[]>([]);

    const openBatchGroupModal = useMemoizedFn(() => {
        setBatchAddModalVisible(true);
        setBatchAddStatus('beforeAdd');
        setIntegration(undefined);
        setTemplateFile(undefined);
    });

    const hiddenBatchGroupModal = useMemoizedFn(() => {
        setBatchAddModalVisible(false);
    });

    const batchAddFormSubmit = useMemoizedFn(async (data: BatchAddProps, callback: () => void) => {
        /**
         * Currently it the process of adding, indicating that
         * the addition is completed and close modal
         */
        if (batchAddStatus === 'adding') {
            setBatchAddModalVisible(false);
            getDevices?.();
            deviceGroupRef?.current?.getDeviceGroups?.();
            callback?.();
            toast.success(getIntlText('common.message.operation_success'));
            return;
        }

        /**
         * The current status is before add, indicating that
         * it is about to enter the adding status
         */
        const { integration, uploadFile } = data || {};
        const { original } = uploadFile;
        if (!integration || !original) return;

        const [error, resp] = await awaitWrap(
            deviceAPI.parseDeviceBatchTemplate({
                integration,
                file: original,
            }),
        );
        if (error || !isRequestSuccess(resp)) {
            return;
        }

        const result = getResponseData(resp);
        if (
            !result ||
            !Array.isArray(result?.create_device_requests) ||
            isEmpty(result?.create_device_requests)
        ) {
            return;
        }

        setIntegration(integration);
        setTemplateFile(original);
        setAddList(result?.create_device_requests || []);
        setRowIds(result?.row_id || []);
        setBatchAddStatus('adding');
    });

    return {
        batchAddModalVisible,
        batchAddStatus,
        addList,
        integration,
        templateFile,
        rowIds,
        openBatchGroupModal,
        hiddenBatchGroupModal,
        batchAddFormSubmit,
    };
}
