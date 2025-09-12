import { useMemo, useCallback, useState, useEffect } from 'react';
import { type ControllerProps } from 'react-hook-form';
import { useRequest } from 'ahooks';
import { FormControl, FormHelperText } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { Select } from '@milesight/shared/src/components';
import { checkRequired } from '@milesight/shared/src/utils/validators';
import { camthinkApi, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import { useEntityFormItems, IMAGE_ENTITY_KEYWORD, type UseEntityFormItemsProps } from '@/hooks';
import { type InteEntityType } from '../../../../../hooks';
import { getModelId, transModelInputs2Entities } from '../../../helper';
import DeviceSelect, { type ValueType as DeviceSelectValueType } from '../device-select';
import ImageEntitySelect from '../image-entity-select';

export type FormDataProps = Record<string, any>;

type AiModelEntityType = InteEntityType & { children?: InteEntityType[] };

type Props = {
    /** Modal visible */
    visible?: boolean;

    /** Whether the form is read-only */
    readonly?: boolean;

    entities?: AiModelEntityType[];

    device?: DeviceSelectValueType | null;

    modelId?: ApiKey | null;
};

export const DEVICE_KEY = '$device';
export const IMAGE_ENTITY_KEY = '$image_entity';
export const AI_MODEL_KEY = 'model_id';
export const AI_INFER_INPUTS_KEY = 'infer_inputs';

const useFormItems = ({ visible, readonly, entities, device, modelId }: Props) => {
    const { getIntlText } = useI18n();

    // ---------- Generate device form items ----------
    const deviceId = device?.id;
    const [isDeviceOptionsReady, setIsDeviceOptionsReady] = useState(false);
    const [isImageOptionsReady, setIsImageOptionsReady] = useState(false);
    const deviceFormItems = useMemo(() => {
        const result: ControllerProps<FormDataProps>[] = [
            {
                name: DEVICE_KEY,
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                    },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    const innerValue = !value
                        ? null
                        : typeof value !== 'string'
                          ? value
                          : { id: value };
                    return (
                        <FormControl fullWidth size="small" disabled={disabled} sx={{ mb: 1.5 }}>
                            <DeviceSelect
                                required
                                disabled={disabled}
                                label={getIntlText('common.label.device')}
                                value={innerValue}
                                onChange={(_, val) => onChange(val)}
                                isBound={!!readonly}
                                onReadyStateChange={() => setIsDeviceOptionsReady(true)}
                            />
                            {error && (
                                <FormHelperText error sx={{ mt: 0.5 }}>
                                    {error?.message}
                                </FormHelperText>
                            )}
                        </FormControl>
                    );
                },
            },
            {
                name: IMAGE_ENTITY_KEY,
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                    },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    const innerValue = !value
                        ? null
                        : typeof value !== 'string'
                          ? value
                          : { key: value };

                    return (
                        <FormControl fullWidth size="small" disabled={disabled} sx={{ mb: 1.5 }}>
                            <ImageEntitySelect
                                required
                                disabled={disabled}
                                label={getIntlText('common.label.entity')}
                                deviceId={deviceId}
                                value={innerValue}
                                onChange={(_, val) => onChange(val)}
                                onReadyStateChange={isReady => setIsImageOptionsReady(isReady)}
                            />
                            {error && (
                                <FormHelperText error sx={{ mt: 0.5 }}>
                                    {error?.message}
                                </FormHelperText>
                            )}
                        </FormControl>
                    );
                },
            },
        ];

        return result;
    }, [readonly, deviceId, getIntlText]);

    // ---------- Generate common ai model form items ----------
    const aiFormItems = useMemo(() => {
        const result: ControllerProps<FormDataProps>[] = [
            {
                name: AI_MODEL_KEY,
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                    },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    const options =
                        entities?.map(v => ({
                            label: v.name,
                            value: getModelId(v.key),
                        })) || [];

                    return (
                        <Select
                            required
                            label={getIntlText('common.label.ai_model')}
                            placeholder={getIntlText('common.placeholder.select')}
                            error={error}
                            disabled={disabled}
                            options={options}
                            value={value || ''}
                            onChange={e => {
                                const { value } = e.target;
                                onChange(value);
                            }}
                        />
                    );
                },
            },
        ];

        return result;
    }, [entities, getIntlText]);

    // ---------- Generate dynamic ai model form items ----------
    const [isAiDynamicFormReady, setIsAiDynamicFormReady] = useState(false);
    const { data: [dynamicFormEntities, wholeDynamicFormEntities] = [] } = useRequest(
        async () => {
            if (!modelId) return;
            const [error, resp] = await awaitWrap(
                camthinkApi.syncModelDetail({ model_id: modelId }),
            );

            if (error || !isRequestSuccess(resp)) return;
            const data = getResponseData(resp);
            const result: UseEntityFormItemsProps['entities'] = transModelInputs2Entities(
                data?.input_entities,
            );

            setIsAiDynamicFormReady(true);
            return [
                result?.filter(v => !v.valueAttribute.format?.includes(IMAGE_ENTITY_KEYWORD)),
                result,
            ];
        },
        {
            debounceWait: 300,
            refreshDeps: [modelId],
        },
    );
    const {
        formItems: aiDynamicFormItems,
        encodedEntityKeys,
        decodeFormParams: decodeEntityParams,
    } = useEntityFormItems({
        isAllReadOnly: readonly,
        entities: dynamicFormEntities,
    });

    // ---------- Decode form params ----------
    const dynamicEntityKeyMap = useMemo(() => {
        const map: Record<string, string> = {};
        Object.keys(encodedEntityKeys).forEach(key => {
            const fieldKey = key.split('.').pop() as string;
            map[fieldKey] = encodedEntityKeys[key];
        });
        return map;
    }, [encodedEntityKeys]);

    const decodeFormParams = useCallback(
        (data: FormDataProps) => {
            const result: Record<string, any> = {};
            const entityMapList = Object.entries(dynamicEntityKeyMap);

            Object.keys(data).forEach(key => {
                const entityKeyPair = entityMapList.find(v => v[1] === key);
                if (!entityKeyPair) {
                    switch (key) {
                        case DEVICE_KEY: {
                            result.id = data[key]?.id;
                            break;
                        }
                        case IMAGE_ENTITY_KEY: {
                            result.image_entity_key = data[key]?.key;
                            break;
                        }
                        default: {
                            result[key] = data[key];
                            break;
                        }
                    }
                } else {
                    const fieldKey = entityKeyPair[0];

                    if (!result[AI_INFER_INPUTS_KEY]) {
                        result[AI_INFER_INPUTS_KEY] = {};
                    }
                    result[AI_INFER_INPUTS_KEY][fieldKey] = data[key];
                }
            });

            return result;
        },
        [dynamicEntityKeyMap],
    );

    const decodeAiFormParams = useCallback(
        (data: Record<string, any>) => {
            const result = decodeEntityParams(data);
            const imageEntity = wholeDynamicFormEntities?.find(item =>
                item.valueAttribute.format?.includes(IMAGE_ENTITY_KEYWORD),
            );

            if (!imageEntity) return;
            result[imageEntity.key] = !data[IMAGE_ENTITY_KEY] ? '' : data[IMAGE_ENTITY_KEY].value;

            return result;
        },
        [wholeDynamicFormEntities, decodeEntityParams],
    );

    // Clear the state when modal close
    useEffect(() => {
        if (visible) return;
        setIsImageOptionsReady(false);
        setIsAiDynamicFormReady(false);
    }, [visible]);

    return {
        aiFormItems,
        aiDynamicFormItems,
        isAiDynamicFormReady,
        deviceFormItems,
        isDeviceOptionsReady,
        isImageOptionsReady,
        dynamicEntityKeyMap,
        decodeFormParams,
        decodeAiFormParams,
    };
};

export default useFormItems;
