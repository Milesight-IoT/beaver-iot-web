import { useEffect, useMemo, useState } from 'react';
import { Tooltip, Chip, type SxProps } from '@mui/material';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import cls from 'classnames';
import { useI18n, useTheme } from '@milesight/shared/src/hooks';
import { flattenObject } from '@milesight/shared/src/utils/tools';
import { InfoOutlinedIcon, LoadingButton, toast } from '@milesight/shared/src/components';
import { entityAPI, awaitWrap, isRequestSuccess } from '@/services/http';
import { useEntity, type InteEntityType } from '../../../hooks';
import Services from './services';
import useFormItems, { OPENAPI_KEYS, type FormDataProps } from './useFormItems';
import './style.less';

interface Props {
    /** Entity list */
    entities?: InteEntityType[];

    /** Edit successful callback */
    onUpdateSuccess?: () => void;
}

type OpenapiStatusItemType = {
    /** International copywriting */
    intlKey: string;
    /** pattern */
    sx?: SxProps;
};

/**
 * OpenAPI state enumeration
 */
type OpenapiStatusType = 'READY' | 'NOT_READY' | 'ERROR';

/**
 * Integrated configuration component
 */
const Config: React.FC<Props> = ({ entities, onUpdateSuccess }) => {
    const { getIntlText } = useI18n();
    const { blue, green, red } = useTheme();
    const { getEntityKey, getEntityValues } = useEntity({ entities });

    // ---------- form related processing logic ----------
    const formItems = useFormItems();
    const { control, formState, handleSubmit, setValue } = useForm<FormDataProps>();
    const onSubmit: SubmitHandler<FormDataProps> = async params => {
        const finalParams =
            params &&
            Object.entries(flattenObject(params)).reduce(
                (acc, [key, value]) => {
                    const entityKey = getEntityKey(key);

                    if (entityKey && value !== undefined) {
                        entityKey && (acc[entityKey] = value);
                    }
                    return acc;
                },
                {} as Record<string, any>,
            );

        // console.log({ finalParams });
        if (!finalParams || !Object.keys(finalParams).length) {
            console.warn(`params is empty, the origin params is ${JSON.stringify(params)}`);
            return;
        }

        const [error, resp] = await awaitWrap(entityAPI.updateProperty({ exchange: finalParams }));
        if (error || !isRequestSuccess(resp)) {
            onUpdateSuccess?.();
            return;
        }

        onUpdateSuccess?.();
        toast.success({ content: getIntlText('common.message.operation_success') });
    };
    const [openapiStatus, setOpenapiStatus] = useState<OpenapiStatusType>('NOT_READY');
    const openapiStatusMap = useMemo<Record<OpenapiStatusType, OpenapiStatusItemType>>(
        () => ({
            READY: {
                intlKey: getIntlText('setting.integration.api_status_ready'),
                sx: { bgcolor: green[200], color: 'success.main' },
            },
            NOT_READY: {
                intlKey: getIntlText('setting.integration.api_status_waiting'),
                sx: { bgcolor: blue[200], color: 'primary.main' },
            },
            ERROR: {
                intlKey: getIntlText('setting.integration.api_status_error'),
                sx: { bgcolor: red[200], color: 'error.main' },
            },
        }),
        [blue, green, red, getIntlText],
    );

    // Form data backfill
    useEffect(() => {
        const formData = getEntityValues([
            OPENAPI_KEYS.STATUS,
            OPENAPI_KEYS.CLIENT_ID,
            OPENAPI_KEYS.SERVER_URL,
            OPENAPI_KEYS.CLIENT_SECRET,
        ]);

        // console.log({ formData });
        setOpenapiStatus(formData[OPENAPI_KEYS.STATUS] || 'NOT_READY');

        setValue(OPENAPI_KEYS.SERVER_URL, formData[OPENAPI_KEYS.SERVER_URL] as never);
        setValue(OPENAPI_KEYS.CLIENT_ID, formData[OPENAPI_KEYS.CLIENT_ID] as never);
        setValue(OPENAPI_KEYS.CLIENT_SECRET, formData[OPENAPI_KEYS.CLIENT_SECRET] as never);
    }, [getEntityValues, setValue]);

    return (
        <>
            <div className="ms-int-config">
                <div className="ms-int-config__header">
                    <h2>{getIntlText('setting.integration.openapi_config')}</h2>
                    <Tooltip
                        title={getIntlText('setting.integration.openapi_config_helper_text')}
                        sx={{ ml: 0.5 }}
                    >
                        <InfoOutlinedIcon />
                    </Tooltip>
                </div>
                <div className="ms-int-config__body">
                    <div className="status">
                        <span className="status-label">
                            {getIntlText('setting.integration.api_status')}
                            {getIntlText('common.symbol.colon')}
                        </span>
                        <span className="status-value">
                            <Chip
                                label={openapiStatusMap[openapiStatus].intlKey}
                                sx={openapiStatusMap[openapiStatus].sx}
                            />
                            {/* <Chip
                                label={getIntlText('setting.integration.api_status_ready')}
                                sx={{ bgcolor: green[200], color: 'success.main' }}
                            /> */}
                        </span>
                    </div>
                    <div className={cls('form', { loading: formState.isSubmitting })}>
                        {formItems.map(props => (
                            <Controller<FormDataProps>
                                {...props}
                                key={props.name}
                                control={control}
                            />
                        ))}
                    </div>
                    <LoadingButton
                        variant="contained"
                        loading={formState.isSubmitting}
                        onClick={handleSubmit(onSubmit)}
                        sx={{ mt: 1 }}
                    >
                        {getIntlText('common.label.connect')}
                    </LoadingButton>
                </div>
            </div>
            <Services entities={entities} onUpdateSuccess={onUpdateSuccess} />
        </>
    );
};

export default Config;
