import { Autocomplete, TextField, Checkbox, Tooltip, Chip } from '@mui/material';

import type { AutocompleteProps } from '@mui/material';

import { useI18n } from '@milesight/shared/src/hooks';
import { useEntitySelectOptionsByDevice } from '../../hooks';

import './style.less';

type EntitySelectProps = AutocompleteProps<EntityOptionTypeForDevice, true, false, undefined> &
    EntitySelectCommonProps<EntityOptionTypeForDevice[]>;

/**
 * 实体选择下拉框组件（多选）
 */
const MultiEntitySelectByDevice = (props: EntitySelectProps) => {
    const {
        value,
        onChange,
        entityType,
        entityValueTypes,
        customFilterEntity,
        /**
         * 默认最大可选择 5 个
         */
        maxCount = 5,
        deviceId,
        ...restProps
    } = props;

    const { getIntlText } = useI18n();

    /**
     * 动态从服务器获取 options
     */
    const {
        loading,
        options = [],
        filterOptions,
    } = useEntitySelectOptionsByDevice({
        entityType,
        entityValueTypes,
        customFilterEntity,
        deviceId,
    });

    const renderOption: EntitySelectProps['renderOption'] = (optionProps, option, { selected }) => {
        const { label, value } = option || {};

        return (
            <li {...(optionProps || {})} key={value}>
                <div className="ms-multi-entity-select">
                    <Checkbox style={{ marginRight: 8 }} checked={selected} />
                    <div className="ms-entity-select-item">
                        <div className="ms-entity-select-item__label" title={label}>
                            {label}
                        </div>
                    </div>
                </div>
            </li>
        );
    };
    return (
        <Autocomplete
            {...restProps}
            value={value}
            multiple
            onChange={(_, option) => onChange(option)}
            options={options}
            getOptionDisabled={option => {
                const currentValue = value || [];
                /**
                 * 默认实体最多只能选择 5 个
                 */
                if (currentValue.length < maxCount) {
                    return false;
                }

                return currentValue.every(e => e.value !== option.value);
            }}
            renderInput={params => (
                <TextField
                    {...params}
                    label={getIntlText('common.label.entity')}
                    error={(restProps as any).error}
                    helperText={
                        (restProps as any).error ? (
                            <div style={{ marginLeft: -14 }}>
                                {(restProps as any).error.message}
                            </div>
                        ) : (
                            ''
                        )
                    }
                />
            )}
            renderOption={renderOption}
            getOptionLabel={option => option?.label || ''}
            loading={loading}
            filterOptions={options => options}
            onInputChange={(_, keyword, reason) => {
                filterOptions(keyword);
            }}
            isOptionEqualToValue={(option, currentVal) => option.value === currentVal.value}
        />
    );
};

export default MultiEntitySelectByDevice;
