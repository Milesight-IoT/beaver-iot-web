import { useMemo } from 'react';
import { MenuItem, Autocomplete, TextField } from '@mui/material';
import type { AutocompleteProps } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { useAddressOptions } from '../../hooks';

import './style.less';

type EntitySelectProps = AutocompleteProps<AdressType, undefined, false, undefined> &
    EntitySelectCommonProps<AdressType>;

/**
 * 实体选择下拉框组件（单选）
 */
const AddressSelect = (props: EntitySelectProps) => {
    const { value, onChange, ...restProps } = props;

    const { getIntlText } = useI18n();

    /**
     * 动态从服务器获取 options
     */
    const { loading, getAddrLists, options = [] } = useAddressOptions();

    const renderOption: EntitySelectProps['renderOption'] = (optionProps, option) => {
        const { label, value } = option || {};

        return (
            <MenuItem {...(optionProps || {})} key={value}>
                <div className="ms-entity-select-item">
                    <div className="ms-entity-select-item__label" title={label}>
                        {label}
                    </div>
                </div>
            </MenuItem>
        );
    };

    // const handleChange = (val: any, val2: any) => {
    //     console.log(val2, "🚀 ~ handleChange ~ val:", val)
    //     onChange(val2)
    // }

    return (
        <Autocomplete
            {...restProps}
            value={value}
            onChange={(_, option) => onChange(option)}
            options={options}
            renderInput={params => (
                <TextField
                    {...params}
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
                    label={getIntlText('common.label.address')}
                />
            )}
            renderOption={renderOption}
            getOptionLabel={option => option?.label || ''}
            loading={loading}
            filterOptions={options => options}
            onInputChange={(_, keyword, reason) => {
                getAddrLists(keyword);
            }}
            isOptionEqualToValue={(option, currentVal) => option.value === currentVal.value}
        />
    );
};

export default AddressSelect;
