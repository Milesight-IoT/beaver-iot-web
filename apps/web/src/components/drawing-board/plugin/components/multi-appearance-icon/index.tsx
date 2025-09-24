import React, { useMemo } from 'react';
import { useControllableValue, useMemoizedFn } from 'ahooks';
import { get } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';
import { useActivityEntity } from '@/components/drawing-board/plugin/hooks';
import AppearanceIcon, { type AppearanceIconValue } from '../appearance-icon';
import { type SelectProps } from '../select';
import { type IconColorSelectProps } from '../icon-color-select';

export interface MultiAppearanceIconProps {
    value?: Record<string, AppearanceIconValue>;
    onChange?: (value: Record<string, AppearanceIconValue>) => void;
    formData?: AnyDict;
    iconSelectProps?: SelectProps;
    iconSelectColorProps?: IconColorSelectProps;
}

/**
 * Multiple icon and it's color render by entity enum data
 */
const MultiAppearanceIcon: React.FC<MultiAppearanceIconProps> = props => {
    const { formData, iconSelectProps, iconSelectColorProps } = props;

    const [value, setValue] = useControllableValue<Record<string, AppearanceIconValue>>(props);

    const { getLatestEntityDetail } = useActivityEntity();
    const { getIntlText } = useI18n();

    const latestEntityRawData = useMemo(() => {
        const currentEntity: EntityOptionType | undefined = formData?.entity;
        if (!currentEntity) return undefined;

        return getLatestEntityDetail(currentEntity)?.rawData;
    }, [formData, getLatestEntityDetail]) as EntityOptionType['rawData'];

    /**
     * Old data compatibility
     */
    const getLegacyData = useMemoizedFn((key: string): AppearanceIconValue | undefined => {
        if (!key || !formData) return undefined;

        return {
            icon: get(formData, `Icon_${key}`),
            color: get(formData, `IconColor_${key}`),
        };
    });

    if (!latestEntityRawData) {
        return null;
    }

    const { entityValueAttribute, entityId } = latestEntityRawData || {};
    const { enum: enumStruct } = entityValueAttribute || {};

    // Non - enumeration
    if (!enumStruct) {
        const id = String(entityId);

        return (
            <AppearanceIcon
                label={getIntlText('common.label.appearance')}
                value={get(value, id, getLegacyData(id))}
                onChange={newIcon =>
                    setValue(oldValue => ({
                        ...oldValue,
                        [id]: {
                            ...newIcon,
                        },
                    }))
                }
                iconSelectProps={iconSelectProps}
                iconSelectColorProps={iconSelectColorProps}
            />
        );
    }

    // Enumeration type
    return Object.keys(enumStruct || {}).map(enumKey => {
        const enumValue = enumStruct[enumKey];
        return (
            <AppearanceIcon
                key={enumKey}
                label={getIntlText('common.label.appearance_of_status', {
                    1: enumValue,
                })}
                value={get(value, enumKey, getLegacyData(enumKey))}
                onChange={newIcon =>
                    setValue(oldValue => ({
                        ...oldValue,
                        [enumKey]: {
                            ...newIcon,
                        },
                    }))
                }
                iconSelectProps={iconSelectProps}
                iconSelectColorProps={iconSelectColorProps}
            />
        );
    });
};

export default React.memo(MultiAppearanceIcon);
