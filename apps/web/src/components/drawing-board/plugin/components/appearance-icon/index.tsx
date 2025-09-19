import React, { ReactNode } from 'react';
import { useControllableValue } from 'ahooks';
import { get } from 'lodash-es';

import { type SelectProps } from '../select';
import IconSelect from '../icon-select';
import IconColorSelect, { type IconColorSelectProps } from '../icon-color-select';

import './style.less';

export interface AppearanceIconValue {
    icon?: string;
    color?: string;
}

export interface AppearanceIconProps {
    value?: AppearanceIconValue;
    onChange?: (value: AppearanceIconValue) => void;
    formData?: AnyDict;
    /**
     * Old data icon value compatibility
     */
    legacyIconKey?: string;

    /**
     * Old data icon color compatibility
     */
    legacyColorKey?: string;
    /**
     * Default component value
     */
    defaultValue?: AppearanceIconValue;
    label?: ReactNode;
    iconSelectProps?: SelectProps;
    iconSelectColorProps?: IconColorSelectProps;
}

/**
 * Select icon and it's color
 */
const AppearanceIcon: React.FC<AppearanceIconProps> = props => {
    const {
        label,
        iconSelectProps,
        iconSelectColorProps,
        formData,
        legacyIconKey,
        legacyColorKey,
        defaultValue,
    } = props;

    const [value, setValue] = useControllableValue<AppearanceIconValue>(props);

    return (
        <div className="appearance-icon">
            <div className="appearance-icon__container">
                <div className="appearance-icon__label">{label}</div>
                <IconSelect
                    {...iconSelectProps}
                    value={
                        value?.icon ||
                        get(formData, legacyIconKey || '') ||
                        defaultValue?.icon ||
                        ''
                    }
                    onChange={(icon: string) => {
                        setValue(oldValue => ({ ...oldValue, icon }));
                    }}
                />
                <IconColorSelect
                    {...iconSelectColorProps}
                    value={
                        value?.color ||
                        get(formData, legacyColorKey || '') ||
                        defaultValue?.color ||
                        ''
                    }
                    onChange={color => setValue(oldValue => ({ ...oldValue, color }))}
                />
            </div>
        </div>
    );
};

export default React.memo(AppearanceIcon);
