import { useMemo } from 'react';
import * as Icons from '@milesight/shared/src/components/icons';
import { Tooltip } from '@/plugin/view-components';
import { useModel } from '@/adapter/models/getEntityStatus';
import type { ViewConfigProps } from '../typings';
import './style.less';

interface Props {
    config: ViewConfigProps;
    configJson: CustomComponentProps;
}
const View = (props: Props) => {
    const { config, configJson } = props;
    const { title } = config || {};
    const { isPreview } = configJson || {};

    const { data } = useModel({
        viewProps: props,
        adapter: {
            model: 'entityStatus',
        },
    });
    const { label, value } = data || {};

    // 当前实体图标
    const { Icon, iconColor } = useMemo(() => {
        const iconType = config?.[`Icon_${value}`];
        const Icon = iconType && Icons[iconType as keyof typeof Icons];
        const iconColor = config?.[`IconColor_${value}`];

        return {
            Icon,
            iconColor,
        };
    }, [config, value]);

    return (
        <div className={`data-view ${isPreview ? 'data-view-preview' : ''}`}>
            {Icon && (
                <div className="data-view__icon">
                    <Icon sx={{ color: iconColor, fontSize: 32 }} />
                </div>
            )}
            <div className="data-view__text">
                <Tooltip className="data-view__title" autoEllipsis title={title} />
                <div className="data-view__container">
                    <span className="data-view__content">{label || '-'}</span>
                </div>
            </div>
        </div>
    );
};

export default View;
