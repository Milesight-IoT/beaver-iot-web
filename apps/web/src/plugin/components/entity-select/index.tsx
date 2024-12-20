import { useMemo } from 'react';
import { MenuItem, Autocomplete, TextField, Tooltip } from '@mui/material';
import type { AutocompleteProps } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { useEntitySelectOptions } from '../../hooks';

import './style.less';

type EntitySelectProps = AutocompleteProps<EntityOptionType, undefined, false, undefined> &
    EntitySelectCommonProps<EntityOptionType> & {
        required?: boolean;
    };

/**
 * 实体选择下拉框组件（单选）
 */
const EntitySelect = (props: EntitySelectProps) => {
    const {
        value,
        onChange,
        entityType,
        entityValueTypes,
        entityAccessMods,
        entityExcludeChildren,
        customFilterEntity,
        required,
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

    const renderOption: EntitySelectProps['renderOption'] = (optionProps, option) => {
        const { label, value, description } = option || {};

        return (
            <MenuItem {...(optionProps || {})} key={value}>
                <div className="ms-entity-select-item">
                    <div className="ms-entity-select-item__label" title={label}>
                        {label}
                    </div>
                    <div className="ms-entity-select-item__description" title={description}>
                        {description}
                    </div>
                </div>
            </MenuItem>
        );
    };

    const renderTooltipTitle = useMemo(() => {
        return value?.description || undefined;
    }, [value]);

    return (
        <Autocomplete
            {...restProps}
            value={value}
            onChange={(_, option) => onChange(option)}
            options={options}
            renderInput={params => (
                <Tooltip title={renderTooltipTitle}>
                    <TextField
                        {...params}
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
                        label={getIntlText('common.label.entity')}
                    />
                </Tooltip>
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
        />
    );
};

export default EntitySelect;
