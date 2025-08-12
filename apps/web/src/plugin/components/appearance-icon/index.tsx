import React from 'react';
import { useControllableValue } from 'ahooks';

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
    title?: string;
    iconSelectProps?: SelectProps;
    iconSelectColorProps?: IconColorSelectProps;
}

/**
 * Select icon and it's color
 */
const AppearanceIcon: React.FC<AppearanceIconProps> = props => {
    const { title, iconSelectProps, iconSelectColorProps } = props;

    const [value, setValue] = useControllableValue<AppearanceIconValue>(props);

    return (
        <div className="appearance-icon">
            <div className="appearance-icon__label">{title}</div>
            <IconSelect
                {...iconSelectProps}
                value={value?.icon || ''}
                onChange={(icon: string) => {
                    setValue(oldValue => ({ ...oldValue, icon }));
                }}
            />
            <IconColorSelect
                {...iconSelectColorProps}
                value={value?.color || ''}
                onChange={color => setValue(oldValue => ({ ...oldValue, color }))}
            />
        </div>
    );
};

export default React.memo(AppearanceIcon);
