import React from 'react';
import { cloneDeep } from 'lodash-es';
import { TextField, IconButton } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { checkRequired, checkMaxLength } from '@milesight/shared/src/utils/validators';
import { DeleteOutlineIcon } from '@milesight/shared/src/components';
import './style.less';

export type ResultSettingItem = {
    /** Parameter Name */
    name: string;
    /** Entity Name */
    entityName?: string;
    /** Entity ID */
    entityId: ApiKey;
    /** Entity Value Type */
    entityValueType: EntityValueDataType;
};

export interface Props {
    /** Whether to disable the all form items */
    disabled?: boolean;

    data: null | { title?: string; params: ResultSettingItem[] }[];

    onChange?: (data: Props['data']) => void;
}

const validators = [checkRequired(), checkMaxLength({ max: 64 })];

const ResultSetting: React.FC<Props> = ({ data, disabled, onChange }) => {
    const { getIntlText } = useI18n();
    const handleChange = (index: number, entityId: ApiKey, newData: Partial<ResultSettingItem>) => {
        if (!data?.[index]) return;
        const result = cloneDeep(data);
        const { params } = result[index];
        const idx = params.findIndex(item => item.entityId === entityId);

        params.splice(idx, 1, { ...params[idx], ...newData });
        result[index].params = params;

        onChange?.(result);
    };

    return (
        <div className="ms-com-ai-result-setting-root">
            {data?.map(({ title, params }, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <div className="result-setting-item" key={index}>
                    {!!(title && data.length > 1) && (
                        <div className="result-setting-item-header">
                            {!!title && (
                                <span className="title">
                                    {getIntlText(
                                        'setting.integration.ai_infer_result_area_setting',
                                        { 1: title },
                                    )}
                                </span>
                            )}
                            {data.length > 1 && (
                                <IconButton>
                                    <DeleteOutlineIcon />
                                </IconButton>
                            )}
                        </div>
                    )}
                    <div className="result-setting-item-body">
                        {params.map(param => {
                            const validateResults = validators.map(validator => {
                                const result = validator(param.entityName);
                                return result;
                            });
                            const error = validateResults.find(
                                result => typeof result === 'string',
                            );

                            return (
                                <div className="params-item" key={param.entityId}>
                                    <TextField
                                        disabled
                                        fullWidth
                                        value={param.name}
                                        label={getIntlText('common.label.param_name')}
                                        slotProps={{ input: { size: 'small' } }}
                                    />
                                    <TextField
                                        fullWidth
                                        autoComplete="off"
                                        disabled={disabled}
                                        error={!!error}
                                        value={param.entityName}
                                        label={getIntlText('device.label.param_entity_name')}
                                        slotProps={{ input: { size: 'small' } }}
                                        helperText={error}
                                        onChange={e =>
                                            handleChange(index, param.entityId, {
                                                entityName: e.target.value,
                                            })
                                        }
                                    />
                                    <TextField
                                        disabled
                                        fullWidth
                                        value={param.entityId}
                                        label={getIntlText('device.label.param_entity_id')}
                                        slotProps={{ input: { size: 'small' } }}
                                    />
                                    <TextField
                                        disabled
                                        fullWidth
                                        value={param.entityValueType}
                                        label={getIntlText('common.label.entity_type')}
                                        slotProps={{ input: { size: 'small' } }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ResultSetting;
