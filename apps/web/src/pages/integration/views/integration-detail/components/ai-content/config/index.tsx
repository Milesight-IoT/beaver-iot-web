import { useEffect } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import cls from 'classnames';
import { useI18n } from '@milesight/shared/src/hooks';
import { flattenObject } from '@milesight/shared/src/utils/tools';
import { InfoOutlinedIcon, LoadingButton, toast } from '@milesight/shared/src/components';
import { entityAPI, awaitWrap, isRequestSuccess } from '@/services/http';
import { useEntity, type InteEntityType } from '../../../hooks';
import { useFormItems, AI_KEYS, type FormDataProps } from './hook';

import './style.less';

interface Props {
    /** Entity list */
    entities?: InteEntityType[];

    /** Edit successful callback */
    onUpdateSuccess?: (successCb?: (entityList: any) => void) => void;
}

/**
 * ai integrated configuration component
 */
const Config: React.FC<Props> = ({ entities, onUpdateSuccess }) => {
    const { getIntlText } = useI18n();
    const { getEntityKey, getEntityValues } = useEntity({ entities });

    // ---------- form related processing logic ----------
    const formItems = useFormItems();
    const { control, formState, handleSubmit, setValue } = useForm<FormDataProps>();
    const onSubmit: SubmitHandler<FormDataProps> = async params => {
        const finalParams = Object.entries(flattenObject(params)).reduce(
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
        if (error || !isRequestSuccess(resp)) {
            onUpdateSuccess?.();
            return;
        }

        onUpdateSuccess?.();
        toast.success({ content: getIntlText('common.message.operation_success') });
    };

    // Form data backfill
    useEffect(() => {
        const formData = getEntityValues([AI_KEYS.STATUS, AI_KEYS.SERVER_URL, AI_KEYS.SECRET]);

        setValue(AI_KEYS.STATUS, formData[AI_KEYS.STATUS] as never);
        setValue(AI_KEYS.SERVER_URL, formData[AI_KEYS.SERVER_URL] as never);
        setValue(AI_KEYS.SECRET, formData[AI_KEYS.SECRET] as never);
    }, [getEntityValues, setValue]);

    return (
        <div className="ms-view-ai-config">
            <div className="ms-view-ai-config-header">
                <h2>{getIntlText('setting.integration.configuration')}</h2>
            </div>
            <div className="ms-view-ai-config-body">
                <div className={cls('form', { loading: formState.isSubmitting })}>
                    {formItems.map(props => (
                        <Controller<FormDataProps> {...props} key={props.name} control={control} />
                    ))}
                </div>
                <LoadingButton
                    variant="contained"
                    loading={formState.isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                    sx={{ mt: 1 }}
                >
                    {getIntlText('common.button.save')}
                </LoadingButton>
            </div>
        </div>
    );
};

export default Config;
