import { useCallback, useEffect, useMemo, useState } from 'react';
import { pick } from 'lodash-es';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { DescriptionsProps, Tooltip } from '@/components';
import {
    awaitWrap,
    isRequestSuccess,
    getResponseData,
    credentialsApi,
    CredentialType,
} from '@/services/http';
import EditSmtp from './components/edit-modal';
import ConfigCell from '../config-cell';
import { FormDataProps } from './components/edit-modal/hooks/useFormItems';
import PasswordLabel from '../password-label';

const EmptySmtpHttpData: FormDataProps = {
    host: '',
    port: '',
    username: '',
    accessSecret: '',
    encryption: '',
};

/** smtp config intl key */
const SmtpIntlKey = {
    host: 'setting.credentials.label.smtp_addr',
    port: 'setting.credentials.label.smtp_port',
    username: 'user.label.user_name_table_title',
    accessSecret: 'common.label.password',
    encryption: 'setting.credentials.label.smtp_encryption',
};

/**
 * credentials whiteLabel component
 */
const WhiteLabel = () => {
    const { getIntlText } = useI18n();
    const [updateFlag, setUpdateFlag] = useState<boolean>(false);
    const [editSmtp, setEditSmtp] = useState<boolean>(false);
    const [smtpDetail, setSmtpDetail] = useState<ObjectToCamelCase<CredentialType> | undefined>();

    useEffect(() => {
        getSmtpConfig();
    }, [updateFlag]);

    // init smtp config
    const getSmtpConfig = async () => {
        const [error, resp] = await awaitWrap(
            credentialsApi.getDefaultCredential({
                credentialsType: 'SMTP',
            }),
        );
        const data = getResponseData(resp);
        if (error || !data || !isRequestSuccess(resp)) {
            return;
        }
        setSmtpDetail(objectToCamelCase(data));
    };

    const handleEditSmtp = () => {
        setEditSmtp(true);
    };

    const onUpdateSuccess = () => {
        setUpdateFlag(!updateFlag);
        setEditSmtp(false);
    };

    // init smtp config
    const smtpConfig: DescriptionsProps['data'] = useMemo(() => {
        let config: FormDataProps = EmptySmtpHttpData;
        if (smtpDetail) {
            config = pick(
                { ...smtpDetail, ...(smtpDetail?.additionalData || EmptySmtpHttpData) },
                Object.keys(EmptySmtpHttpData),
            ) as FormDataProps;
        }
        return Object.entries(config).map(([key, value]) => {
            return {
                key,
                label: (
                    <Tooltip
                        autoEllipsis
                        title={getIntlText(SmtpIntlKey[key as keyof FormDataProps])}
                    />
                ),
                content: !(key.includes('Secret') && !!value) ? (
                    value || ''
                ) : (
                    <PasswordLabel text={value} />
                ),
            };
        });
    }, [smtpDetail]);

    return (
        <div className="ms-credentials-white-label">
            <ConfigCell
                title={getIntlText('setting.credentials.label.smtp_title')}
                configData={smtpConfig}
                onEdit={handleEditSmtp}
            />
            {editSmtp && (
                <EditSmtp
                    data={smtpDetail}
                    visible={editSmtp}
                    onCancel={() => setEditSmtp(false)}
                    onUpdateSuccess={onUpdateSuccess}
                />
            )}
        </div>
    );
};

export default WhiteLabel;
