import { Autocomplete, TextField, Checkbox, Tooltip, Chip } from '@mui/material';

import type { AutocompleteProps } from '@mui/material';

import { useI18n } from '@milesight/shared/src/hooks';
import { useEntitySelectOptions } from '../../hooks';

import './style.less';

type EntitySelectProps = AutocompleteProps<EntityOptionType, true, false, undefined> &
    EntitySelectCommonProps<EntityOptionType[]> & {
        required?: boolean;
    };

/**
 * 实体选择下拉框组件（多选）
 */
const MultiEntitySelect = (props: EntitySelectProps) => {
    const {
        value,
        onChange,
        entityType,
        entityValueTypes,
        entityAccessMods,
        entityExcludeChildren,
        customFilterEntity,
        required,
        /**
         * 默认最大可选择 5 个
         */
        maxCount = 5,
        ...restProps
    } = props;

    const { getIntlText } = useI18n();

    /**
     * 动态从服务器获取 options
     */
    const {
        loading,
        getEntityOptions,
        options = [],
    } = useEntitySelectOptions({
        entityType,
        entityValueTypes,
        entityAccessMods,
        entityExcludeChildren,
        customFilterEntity,
    });

    const renderOption: EntitySelectProps['renderOption'] = (optionProps, option, { selected }) => {
        const { label, value, description } = option || {};

        return (
            <li {...(optionProps || {})} key={value}>
                <div className="ms-multi-entity-select">
                    <Checkbox style={{ marginRight: 8 }} checked={selected} />
                    <div className="ms-entity-select-item">
                        <div className="ms-entity-select-item__label" title={label}>
                            {label}
                        </div>
                        <div className="ms-entity-select-item__description" title={description}>
                            {description}
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
                    required={!!required}
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
                if (reason !== 'input') {
                    getEntityOptions();
                    return;
                }

                getEntityOptions(keyword);
            }}
            isOptionEqualToValue={(option, currentVal) => option.value === currentVal.value}
            renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                        <Tooltip key={key} title={option.description}>
                            <Chip label={option.label} {...tagProps} />
                        </Tooltip>
                    );
                })
            }
        />
    );
};

export default MultiEntitySelect;
