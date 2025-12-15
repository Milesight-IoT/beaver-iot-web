import React, { useEffect, useCallback, useState } from 'react';

import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { isEmpty } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';
import { LoadingButton } from '@milesight/shared/src/components';

import { type EntitySelectOption } from '@/components/entity-select';
import { useFormItems } from './useFormItems';
import { type MarkerExtraInfoProps } from '../../plugins/occupancy-marker/control-panel';

export interface OperateProps {
    occupiedEntity: EntitySelectOption<ApiKey>;
    statusEntity: EntitySelectOption<ApiKey>;
    notification: string;
}

interface Props {
    data?: MarkerExtraInfoProps;
    formData?: AnyDict;
    updateFormData?: (data: AnyDict) => void;
    onSuccess?: () => void;
}

/**
 * Toilet Entity Form
 */
const EntityForm: React.FC<Props> = props => {
    const { data, formData, updateFormData, onSuccess } = props;

    const { getIntlText } = useI18n();

    const { control, handleSubmit, reset } = useForm<OperateProps>();
    const { formItems } = useFormItems();

    const [loading, setLoading] = useState(false);

    /**
     * Config form data
     */
    const handleConfigFormData = useCallback(
        (params: OperateProps) => {
            const markerExtraInfos: MarkerExtraInfoProps[] = formData?.markerExtraInfos || [];
            if (!Array.isArray(markerExtraInfos) || isEmpty(markerExtraInfos) || !data) {
                return;
            }

            /**
             * Find current editing marker extra info by toilet id
             */
            const markerExtraInfo = markerExtraInfos.find(item => item.toiletId === data.toiletId);
            if (!markerExtraInfo) {
                return;
            }

            const { occupiedEntity: occ, statusEntity: status, notification } = params || {};
            const occupiedKey = occ?.rawData?.entityKey || occ?.label || undefined;
            const statusKey = status?.rawData?.entityKey || status?.label || undefined;

            const newMarkerExtraInfo: MarkerExtraInfoProps = {
                ...markerExtraInfo,
                occupiedState: occupiedKey,
                deviceStatus: statusKey,
                notification,
                entityKeyToId: {
                    ...markerExtraInfo?.entityKeyToId,
                    ...(occupiedKey && occ?.value ? { [occupiedKey]: String(occ.value) } : {}),
                    ...(statusKey && status?.value ? { [statusKey]: String(status.value) } : {}),
                },
            };

            /**
             * Update marker extra info and close drawer
             */
            updateFormData?.({
                markerExtraInfos: markerExtraInfos.map(item => {
                    if (item.toiletId === data.toiletId) {
                        return {
                            ...newMarkerExtraInfo,
                            isActive: false,
                        };
                    }

                    return {
                        ...item,
                        isActive: false,
                    };
                }),
            });
        },
        [updateFormData, formData?.markerExtraInfos, data],
    );

    const onSubmit: SubmitHandler<OperateProps> = async params => {
        setLoading(true);
        handleConfigFormData(params);

        /**
         * reset form value and call onSuccess callback
         */
        onSuccess?.();
        reset();
        setLoading(false);
    };

    /**
     * initial form value
     */
    useEffect(() => {
        const { occupiedState, deviceStatus, notification, entityKeyToId } = data || {};
        if (
            !occupiedState ||
            !entityKeyToId?.[occupiedState] ||
            !deviceStatus ||
            !entityKeyToId?.[deviceStatus] ||
            !notification
        ) {
            reset({
                occupiedEntity: undefined,
                statusEntity: undefined,
                notification: undefined,
            });
            return;
        }

        reset({
            occupiedEntity: {
                label: occupiedState,
                value: entityKeyToId[occupiedState],
            },
            statusEntity: {
                label: deviceStatus,
                value: entityKeyToId[deviceStatus],
            },
            notification,
        });
    }, [data, reset]);

    return (
        <>
            <div className="body">
                {formItems.map(item => (
                    <Controller<OperateProps> {...item} key={item.name} control={control} />
                ))}
            </div>

            <div className="save-button">
                <LoadingButton
                    loading={loading}
                    fullWidth
                    variant="contained"
                    onClick={handleSubmit(onSubmit)}
                >
                    {getIntlText('common.button.save')}
                </LoadingButton>
            </div>
        </>
    );
};

export default EntityForm;
