import { useMemo, useEffect } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import cls from 'classnames';
import { isNil } from 'lodash-es';
import { useI18n } from '@milesight/shared/src/hooks';
import { LoadingButton, toast } from '@milesight/shared/src/components';
import { useEntityFormItems, type EntityFormDataProps } from '@/hooks';
import { Empty, Descriptions, Tooltip } from '@/components';
import { entityAPI, awaitWrap, isRequestSuccess } from '@/services/http';
import { type InteEntityType } from '../../../hooks';

interface Props {
    /** Loading or not */
    loading?: boolean;

    /** Entity list */
    entities?: InteEntityType[];

    /** Edit successful callback */
    onUpdateSuccess?: () => void;
}

/**
 * Attribute entity rendering and manipulation components
 */
const Property: React.FC<Props> = ({ loading, entities, onUpdateSuccess }) => {
    const { getIntlText } = useI18n();
    const writableProps = useMemo(() => {
        return entities?.filter(item => item.type === 'PROPERTY' && item.accessMod?.includes('W'));
    }, [entities]);
    const readOnlyProps = useMemo(() => {
        const props = entities?.filter(item => item.type === 'PROPERTY' && item.accessMod === 'R');

        return props?.map(item => {
            const value = !item.valueAttribute?.enum
                ? item.value
                : item.valueAttribute.enum[item.value as any];
            return {
                key: item.key,
                label: <Tooltip autoEllipsis title={item.name} />,
                content: !isNil(value) ? value : '-',
            };
        });
    }, [entities]);

    // ---------- Entity form related logical processing ----------
    const { control, formState, handleSubmit, setValue } = useForm<EntityFormDataProps>();
    const { formItems, decodeFormParams, encodeFormData } = useEntityFormItems({
        entities: writableProps,
        // isAllRequired: true,
    });
    const onSubmit: SubmitHandler<EntityFormDataProps> = async params => {
        const finalParams = decodeFormParams(params);

        if (!finalParams) {
            console.warn(`params is empty, the origin params is ${JSON.stringify(params)}`);
            return;
        }

        const [error, resp] = await awaitWrap(entityAPI.updateProperty({ exchange: finalParams }));
        if (error || !isRequestSuccess(resp)) return;

        onUpdateSuccess?.();
        toast.success({ content: getIntlText('common.message.operation_success') });
    };

    // Form data backfill
    useEffect(() => {
        if (!writableProps?.length) return;

        const formData = encodeFormData(writableProps);

        Object.entries(formData || {}).forEach(([key, value]) => {
            setValue(key, value);
        });
    }, [writableProps, setValue, encodeFormData]);

    return !readOnlyProps?.length && !writableProps?.length ? (
        <Empty
            loading={loading}
            type="nodata"
            text={getIntlText('common.label.empty')}
            className="ms-empty"
        />
    ) : (
        <div className={cls('ms-entity-property', { loading: formState.isSubmitting })}>
            {!!readOnlyProps?.length && (
                <div className="detail-wrap">
                    <h2 className="detail-title">{getIntlText('common.label.readonly')}</h2>
                    <Descriptions data={readOnlyProps} />
                </div>
            )}
            {!!writableProps?.length && (
                <div className="form-wrap">
                    <h2 className="detail-title">{getIntlText('common.label.writable')}</h2>
                    <div className="form-area">
                        {formItems.map(props => (
                            <Controller<EntityFormDataProps>
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
                        {getIntlText('common.button.save')}
                    </LoadingButton>
                </div>
            )}
        </div>
    );
};

export default Property;
