import { useState, useEffect, useMemo } from 'react';
import { Button, Tooltip, Chip, Switch, IconButton, type SxProps } from '@mui/material';
import cls from 'classnames';
import { useI18n, useCopy, useTheme } from '@milesight/shared/src/hooks';
import {
    InfoOutlinedIcon,
    ContentCopyIcon,
    EditIcon,
    toast,
} from '@milesight/shared/src/components';
import { entityAPI, awaitWrap, isRequestSuccess } from '@/services/http';
import { useEntity, type InteEntityType } from '../../../../hooks';
import WebhookModal, {
    WEBHOOK_URL,
    WEBHOOK_KEYS,
    type WebhookFormDataProps,
} from './webhook-modal';
import OpenapiModal, { OPENAPI_SCHEDULED_KEYS, type OpenapiFormDataProps } from './openapi-modal';
import '../style.less';

type WebhookStatusType = 'READY' | 'NOT_READY' | 'ERROR';

type WebhookStatusItemType = {
    /** 国际化文案 */
    intlKey: string;
    /** 样式 */
    sx?: SxProps;
};

interface Props {
    /** 实体列表 */
    entities?: InteEntityType[];

    /** 编辑成功回调 */
    onUpdateSuccess?: () => void;
}

const Services: React.FC<Props> = ({ entities, onUpdateSuccess }) => {
    const { getIntlText } = useI18n();
    const { handleCopy } = useCopy();
    const { blue, green } = useTheme();
    const { getEntityKey, getEntityValues } = useEntity({ entities });

    // ---------- Webhook 相关处理逻辑 ----------
    const [webhookModalVisible, setWebhookModalVisible] = useState(false);
    const [webhookData, setWebhookData] = useState<WebhookFormDataProps>();
    const webhookStatusMap = useMemo<Record<WebhookStatusType, WebhookStatusItemType>>(
        () => ({
            READY: {
                intlKey: getIntlText('setting.integration.webhook_status_ready'),
                sx: { bgcolor: green[200], color: 'success.main' },
            },
            NOT_READY: {
                intlKey: getIntlText('setting.integration.webhook_status_waiting'),
                sx: { bgcolor: blue[200], color: 'primary.main' },
            },
            ERROR: {
                intlKey: getIntlText('setting.integration.webhook_status_error'),
            },
        }),
        [blue, green, getIntlText],
    );
    const handleWebhookUpdate = async (params?: WebhookFormDataProps) => {
        const finalParams =
            params &&
            Object.entries(params).reduce(
                (acc, [key, value]) => {
                    const entityKey = getEntityKey(key);

                    if (entityKey && value !== undefined) {
                        entityKey && (acc[entityKey] = value);
                    }
                    return acc;
                },
                {} as Record<string, any>,
            );

        if (!finalParams || !Object.keys(finalParams).length) {
            console.warn(`params is empty, the origin params is ${JSON.stringify(params)}`);
            return;
        }

        const [error, resp] = await awaitWrap(entityAPI.updateProperty({ exchange: finalParams }));
        if (error || !isRequestSuccess(resp)) return;

        onUpdateSuccess?.();
        setWebhookModalVisible(false);
        toast.success({ content: getIntlText('common.message.operation_success') });
    };

    // ---------- OpenAPI 相关处理逻辑 ----------
    const [openApiModalVisible, setOpenApiModalVisible] = useState(false);
    const [openapiData, setOpenapiData] = useState<OpenapiFormDataProps>();
    const handleOpenapiUpdate = async (params?: OpenapiFormDataProps) => {
        const finalParams =
            params &&
            Object.entries(params).reduce(
                (acc, [key, value]) => {
                    const entityKey = getEntityKey(key);

                    if (entityKey && value !== undefined) {
                        entityKey && (acc[entityKey] = value);
                    }
                    return acc;
                },
                {} as Record<string, any>,
            );

        if (!finalParams || !Object.keys(finalParams).length) {
            console.warn(`params is empty, the origin params is ${JSON.stringify(params)}`);
            return;
        }

        const [error, resp] = await awaitWrap(entityAPI.updateProperty({ exchange: finalParams }));
        if (error || !isRequestSuccess(resp)) return;

        onUpdateSuccess?.();
        setOpenApiModalVisible(false);
        toast.success({ content: getIntlText('common.message.operation_success') });
    };

    // 获取 Service 数据
    useEffect(() => {
        const webhookFormData = getEntityValues([
            WEBHOOK_KEYS.STATUS,
            WEBHOOK_KEYS.ENABLED_KEY,
            WEBHOOK_KEYS.SECRET_KEY,
        ]);
        const openApiFormData = getEntityValues([
            OPENAPI_SCHEDULED_KEYS.ENABLED_KEY,
            OPENAPI_SCHEDULED_KEYS.PERIOD_KEY,
        ]);

        setWebhookData(webhookFormData);
        setOpenapiData(openApiFormData);
    }, [getEntityValues]);

    return (
        <div className="ms-int-service">
            <div className="ms-int-service__header">
                <h2>{getIntlText('setting.integration.data_access_service')}</h2>
            </div>
            <div className="ms-int-service__body">
                <div className="ms-service-card">
                    <div className="ms-service-card__header">
                        <div className="ms-service-card__header-left">
                            <Switch
                                size="small"
                                checked={!!webhookData?.[WEBHOOK_KEYS.ENABLED_KEY]}
                                onChange={_ => {
                                    if (webhookData?.[WEBHOOK_KEYS.ENABLED_KEY]) {
                                        handleWebhookUpdate({ [WEBHOOK_KEYS.ENABLED_KEY]: false });
                                        return;
                                    }
                                    setWebhookModalVisible(true);
                                }}
                            />
                            <span className="title">{getIntlText('common.label.webhook')}</span>
                            <Tooltip
                                title={getIntlText('setting.integration.webhook_helper_text')}
                                sx={{ ml: 0.5 }}
                            >
                                <InfoOutlinedIcon />
                            </Tooltip>
                        </div>
                        <div className="ms-service-card__header-right">
                            {!!webhookData?.[WEBHOOK_KEYS.ENABLED_KEY] && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<EditIcon sx={{ width: 16, height: 16 }} />}
                                    onClick={() => setWebhookModalVisible(true)}
                                >
                                    {getIntlText('common.button.edit')}
                                </Button>
                            )}
                        </div>
                    </div>
                    <div
                        className={cls('ms-service-card__body', {
                            hidden: !webhookData?.[WEBHOOK_KEYS.ENABLED_KEY],
                        })}
                    >
                        <div className="service-prop">
                            <span className="service-prop-label">
                                {getIntlText('setting.integration.webhook_status')}
                                {getIntlText('common.symbol.colon')}
                            </span>
                            <span className="service-prop-value">
                                <Chip
                                    label={
                                        webhookStatusMap[
                                            (webhookData?.[
                                                WEBHOOK_KEYS.STATUS
                                            ] as WebhookStatusType) || 'NOT_READY'
                                        ].intlKey
                                    }
                                    sx={
                                        webhookStatusMap[
                                            (webhookData?.[
                                                WEBHOOK_KEYS.STATUS
                                            ] as WebhookStatusType) || 'NOT_READY'
                                        ].sx
                                    }
                                />
                            </span>
                        </div>
                        <div className="service-prop">
                            <span className="service-prop-label">
                                {getIntlText('setting.integration.webhook_url')}
                                {getIntlText('common.symbol.colon')}
                            </span>
                            <span className="service-prop-value">
                                <span>{WEBHOOK_URL}</span>
                                <IconButton
                                    sx={{ ml: 0.5 }}
                                    onClick={() => handleCopy(WEBHOOK_URL)}
                                >
                                    <ContentCopyIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="ms-service-card">
                    <div className="ms-service-card__header">
                        <div className="ms-service-card__header-left">
                            <Switch
                                size="small"
                                checked={!!openapiData?.[OPENAPI_SCHEDULED_KEYS.ENABLED_KEY]}
                                onChange={_ => {
                                    if (openapiData?.[OPENAPI_SCHEDULED_KEYS.ENABLED_KEY]) {
                                        handleOpenapiUpdate({
                                            [OPENAPI_SCHEDULED_KEYS.ENABLED_KEY]: false,
                                        });
                                        return;
                                    }
                                    setOpenApiModalVisible(true);
                                }}
                            />
                            <span className="title">{getIntlText('common.label.openapi')}</span>
                            <Tooltip
                                title={getIntlText('setting.integration.openapi_helper_text')}
                                sx={{ ml: 0.5 }}
                            >
                                <InfoOutlinedIcon />
                            </Tooltip>
                        </div>
                        <div className="ms-service-card__header-right">
                            {!!openapiData?.[OPENAPI_SCHEDULED_KEYS.ENABLED_KEY] && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<EditIcon sx={{ width: 16, height: 16 }} />}
                                    onClick={() => setOpenApiModalVisible(true)}
                                >
                                    {getIntlText('common.button.edit')}
                                </Button>
                            )}
                        </div>
                    </div>
                    <div
                        className={cls('ms-service-card__body', {
                            hidden: !openapiData?.[OPENAPI_SCHEDULED_KEYS.ENABLED_KEY],
                        })}
                    >
                        <div className="service-prop">
                            <span className="service-prop-label">
                                {getIntlText('setting.integration.openapi_frequency_of_request')}
                                {getIntlText('common.symbol.colon')}
                            </span>
                            <span className="service-prop-value">
                                {openapiData?.[OPENAPI_SCHEDULED_KEYS.PERIOD_KEY]}s
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <WebhookModal
                mode={webhookData && webhookData[WEBHOOK_KEYS.ENABLED_KEY] ? 'edit' : 'switch'}
                data={webhookData}
                visible={webhookModalVisible}
                onCancel={() => setWebhookModalVisible(false)}
                onSubmit={handleWebhookUpdate}
            />
            <OpenapiModal
                mode={
                    openapiData && openapiData[OPENAPI_SCHEDULED_KEYS.ENABLED_KEY]
                        ? 'edit'
                        : 'switch'
                }
                data={openapiData}
                visible={openApiModalVisible}
                onCancel={() => setOpenApiModalVisible(false)}
                onSubmit={handleOpenapiUpdate}
            />
        </div>
    );
};

export default Services;
