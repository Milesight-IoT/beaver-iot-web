import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useTheme } from '@milesight/shared/src/hooks';
import './style.less';

interface IProps {
    Icon: any;
    iconColor: string;
    percent: number;
}
export default React.memo(({ Icon, iconColor, percent }: IProps) => {
    const { blue } = useTheme();

    const RenderIcon = Ionicons;
    const renderIconColor = iconColor || blue[700];
    return (
        <div
            className="ms-remain-chart"
            // @ts-ignore
            style={{ '--ms-remain-percent': percent }}
        >
            {RenderIcon && (
                <div className="ms-remain-chart__content">
                    <div className="ms-remain-chart__icon">
                        <RenderIcon sx={{ color: renderIconColor }} />
                    </div>
                    <div className="ms-remain-chart__mask">
                        <div className="ms-remain-chart__mask-icon">
                            <RenderIcon sx={{ color: renderIconColor }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});
