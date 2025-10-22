import { useMemo, useState } from 'react';
import { useRequest } from 'ahooks';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import { Tooltip, type DescriptionsProps } from '@/components';
import { PERMISSIONS } from '@/constants';
import {
    blueprintAPI,
    awaitWrap,
    isRequestSuccess,
    getResponseData,
    BlueprintSourceType,
} from '@/services/http';
import ConfigTable from '../config-table';
import EditModal from './edit-modal';
import './style.less';

const Blueprint = () => {
    const { getIntlText } = useI18n();
    const { getTimeFormat } = useTime();
    const [modalVisible, setModalVisible] = useState(false);

    // ---------- Fetch Blueprint Setting ----------
    const { data: bpSetting, run: getSetting } = useRequest(
        async () => {
            const [error, resp] = await awaitWrap(blueprintAPI.getSetting());
            if (error || !isRequestSuccess(resp)) return;

            return getResponseData(resp);
        },
        {
            debounceWait: 300,
        },
    );

    // ---------- Generate Title ----------
    const title = useMemo(() => {
        const sourceType = bpSetting?.current_source_type;

        return (
            <>
                <div className="title">{getIntlText('setting.blueprint.management_title')}</div>
                {sourceType === BlueprintSourceType.DEFAULT && (
                    <div className="subtitle">
                        {getIntlText('setting.blueprint.official_store_helper_text')}
                    </div>
                    // <Tooltip
                    //     autoEllipsis
                    //     className="subtitle"
                    //     title={getIntlText('setting.blueprint.official_store_helper_text')}
                    // />
                )}
            </>
        );
    }, [bpSetting, getIntlText]);

    // ---------- Generate Blueprint Setting List ----------
    const listData = useMemo(() => {
        const sourceType = bpSetting?.current_source_type;
        const intlMap: Record<BlueprintSourceType, string> = {
            [BlueprintSourceType.DEFAULT]: getIntlText('setting.blueprint.title_official_store'),
            [BlueprintSourceType.UPLOAD]: getIntlText('common.label.local_upload'),
        };
        const result: DescriptionsProps['data'] = [
            {
                key: 'current_source_type',
                label: getIntlText('common.label.source'),
                autoEllipsis: true,
                content: sourceType ? intlMap[sourceType] : '-',
            },
        ];

        switch (sourceType) {
            case BlueprintSourceType.DEFAULT: {
                result.push(
                    {
                        key: 'version',
                        label: getIntlText('common.label.version'),
                        content: bpSetting?.version || '-',
                    },
                    {
                        key: 'update_time',
                        label: getIntlText('common.label.update_time'),
                        content: !bpSetting?.update_time
                            ? '-'
                            : getTimeFormat(bpSetting?.update_time, 'fullDateTimeSecondFormat'),
                    },
                    {
                        key: 'sync_result',
                        label: getIntlText('setting.blueprint.label_sync_result'),
                        content: bpSetting?.synced_success ? (
                            <Tooltip
                                autoEllipsis
                                title={getIntlText('setting.blueprint.message_sync_success')}
                            />
                        ) : (
                            <Tooltip
                                autoEllipsis
                                sx={{ color: 'error.main' }}
                                title={getIntlText('setting.blueprint.message_sync_failed')}
                            />
                        ),
                    },
                );
                break;
            }
            case BlueprintSourceType.UPLOAD: {
                result.push({
                    key: 'file_name',
                    label: getIntlText('common.label.file_name'),
                    autoEllipsis: true,
                    content: bpSetting?.file_name || '-',
                });
                break;
            }
            default: {
                break;
            }
        }

        return result;
    }, [bpSetting, getIntlText, getTimeFormat]);

    return (
        <>
            <ConfigTable
                title={title}
                configData={listData}
                permissions={PERMISSIONS.CREDENTIAL_MODULE_EDIT}
                onEdit={() => setModalVisible(true)}
            />
            <EditModal
                data={bpSetting}
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                onSuccess={() => {
                    getSetting();
                    setModalVisible(false);
                }}
            />
        </>
    );
};

export default Blueprint;
