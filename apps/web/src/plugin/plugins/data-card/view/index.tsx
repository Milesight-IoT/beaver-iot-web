import { useMemo } from 'react';
import { useTheme } from '@milesight/shared/src/hooks';

import * as Icons from '@milesight/shared/src/components/icons';
import { Tooltip } from '@/plugin/view-components';
import { useSource } from './hooks';
import type { ViewConfigProps } from '../typings';
import './style.less';

interface Props {
    config: ViewConfigProps;
    configJson: CustomComponentProps;
}
const View = (props: Props) => {
    const { config, configJson } = props;
    const { title, entity } = config || {};
    const { entityStatusValue } = useSource({ entity });
    const { isPreview } = configJson || {};

    const { getCSSVariableValue } = useTheme();

    // Current physical real -time data
    const currentEntityData = useMemo(() => {
        const { rawData: currentEntity, value: entityValue } = entity || {};
        if (!currentEntity) return;

        // Get the current selection entity
        const { entityValueAttribute } = currentEntity || {};
        const { enum: enumStruct, unit } = entityValueAttribute || {};
        const currentEntityStatus = entityStatusValue?.toString();

        // Enumeration type
        if (enumStruct) {
            const currentKey = Object.keys(enumStruct).find(enumKey => {
                return enumKey === currentEntityStatus;
            });
            if (!currentKey) return;

            return {
                label: enumStruct[currentKey],
                value: currentKey,
            };
        }

        // Non -enumeration
        return {
            label: unit ? `${currentEntityStatus ?? '- '}${unit}` : `${currentEntityStatus ?? ''}`,
            value: entityValue,
        };
    }, [entity, entityStatusValue]);
    // Current physical icon
    const { Icon, iconColor } = useMemo(() => {
        const { value } = currentEntityData || {};
        const iconType = config?.[`Icon_${value}`];
        const Icon = iconType && Icons[iconType as keyof typeof Icons];
        const iconColor = config?.[`IconColor_${value}`];

        return {
            Icon,
            iconColor,
        };
    }, [config, currentEntityData]);

    return (
        <div className={`data-view ${isPreview ? 'data-view-preview' : ''}`}>
            <div className="data-view-card">
                <div className="data-view-card__content">
                    <div className="data-view-card__header">
                        {Icon && (
                            <Icon
                                sx={{
                                    color: iconColor || getCSSVariableValue('--gray-5'),
                                    // fontSize: 20,
                                }}
                            />
                        )}
                        <Tooltip className="data-view-card__title" autoEllipsis title={title} />
                    </div>
                    <Tooltip autoEllipsis title={currentEntityData?.label || '-'} />
                </div>
            </div>
        </div>
    );
};

export default View;
