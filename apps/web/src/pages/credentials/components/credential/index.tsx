import { useEffect, useMemo, useState } from 'react';
import { useMemoizedFn, useDebounceEffect } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { toast } from '@milesight/shared/src/components';
import { DescriptionsProps, Tooltip } from '@/components';
import {
    awaitWrap,
    getResponseData,
    credentialsApi,
    CredentialType,
    isRequestSuccess,
} from '@/services/http';
import { PERMISSIONS } from '@/constants';
import ConfigTable from '../config-table';
import PasswordLabel from '../password-label';
import { EditCredential } from './components';

type FormDataProps = {
    username: string;
    accessSecret: string;
};

/** mqtt | http config intl key */
const MqttHttpIntlKey: FormDataProps = {
    username: 'user.label.user_name_table_title',
    accessSecret: 'common.label.password',
};

/**
 * credential component
 */
const Credential = () => {
    const { getIntlText } = useI18n();
    const [updateFlag, setUpdateFlag] = useState<boolean>(false);
    const [mqttDetail, setMqttDetail] = useState<ObjectToCamelCase<CredentialType>>();
    const [httpDetail, setHttpDetail] = useState<ObjectToCamelCase<CredentialType>>();
    const [mqttOpen, setMqttOpen] = useState<boolean>(false);
    const [httpOpen, setHttpOpen] = useState<boolean>(false);

    // useEffect(() => {
    //     getMqttAndHttpConfig();
    // }, [updateFlag]);
    useDebounceEffect(
        () => {
            getMqttAndHttpConfig();
        },
        [updateFlag],
        { wait: 300 },
    );

    // init mqtt http config
    const getMqttAndHttpConfig = async () => {
        const [mqttError, mqttResp] = await awaitWrap(
            credentialsApi.getDefaultCredential({
                credentialsType: 'MQTT',
                auto_generate_password: true,
            }),
        );
        const [httpError, httpResp] = await awaitWrap(
            credentialsApi.getDefaultCredential({
                credentialsType: 'HTTP',
                auto_generate_password: true,
            }),
        );

        const mqttData = getResponseData(mqttResp);
        const httpData = getResponseData(httpResp);
        if (mqttData) {
            setMqttDetail(objectToCamelCase(mqttData));
        }
        if (httpData) {
            setHttpDetail(objectToCamelCase(httpData));
        }
    };

    // update mqtt or http
    const handleUpdate = async (
        originData: ObjectToCamelCase<CredentialType> | undefined,
        formData: FormDataProps,
    ) => {
        if (originData) {
            const [err, resp] = await awaitWrap(
                credentialsApi.editCredential({
                    id: originData.id,
                    description: originData.description,
                    access_key: originData.accessKey,
                    access_secret: formData.accessSecret,
                }),
            );

            if (err || !isRequestSuccess(resp)) {
                return;
            }
            handleClose();
            setUpdateFlag(!updateFlag);
            toast.success(getIntlText('common.message.operation_success'));
        }
    };

    const handleClose = () => {
        mqttOpen && setMqttOpen(false);
        httpOpen && setHttpOpen(false);
    };

    const transformDescriptionsData = useMemoizedFn((data: Record<string, any>) => {
        return Object.entries(data).map(([key, value]) => {
            return {
                key,
                label: (
                    <Tooltip
                        autoEllipsis
                        title={getIntlText(MqttHttpIntlKey[key as keyof FormDataProps])}
                    />
                ),
                content: !(key.includes('Secret') && !!value) ? (
                    value || ''
                ) : (
                    <PasswordLabel text={value} />
                ),
            };
        });
    });

    const mqttConfig: DescriptionsProps['data'] = useMemo(() => {
        return transformDescriptionsData({
            username: mqttDetail?.accessKey,
            accessSecret: mqttDetail?.accessSecret,
        });
    }, [mqttDetail]);

    const httpConfig: DescriptionsProps['data'] = useMemo(() => {
        return transformDescriptionsData({
            username: httpDetail?.accessKey,
            accessSecret: httpDetail?.accessSecret,
        });
    }, [httpDetail]);

    return (
        <div className="ms-credentials-credential">
            <ConfigTable
                title={getIntlText('setting.credentials.mqtt')}
                configData={mqttConfig}
                permissions={PERMISSIONS.CREDENTIAL_MODULE_EDIT}
                onEdit={() => setMqttOpen(true)}
            />
            <ConfigTable
                title={getIntlText('setting.credentials.http')}
                configData={httpConfig}
                permissions={PERMISSIONS.CREDENTIAL_MODULE_EDIT}
                onEdit={() => setHttpOpen(true)}
            />
            {mqttOpen && (
                <EditCredential
                    data={mqttDetail}
                    type="mqtt"
                    title={getIntlText('setting.credentials.edit_mqtt')}
                    visible={mqttOpen}
                    onCancel={() => setMqttOpen(false)}
                    onUpdateSuccess={handleUpdate}
                />
            )}
            {httpOpen && (
                <EditCredential
                    data={httpDetail}
                    type="http"
                    title={getIntlText('setting.credentials.edit_http')}
                    visible={httpOpen}
                    onCancel={() => setHttpOpen(false)}
                    onUpdateSuccess={handleUpdate}
                />
            )}
        </div>
    );
};

export default Credential;
