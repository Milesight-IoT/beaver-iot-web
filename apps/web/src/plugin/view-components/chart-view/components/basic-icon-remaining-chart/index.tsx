import React from 'react';
import * as Icons from '@milesight/shared/src/components/icons';
import { useTheme } from '@milesight/shared/src/hooks';
import './style.less';

interface IProps {
    Icon: any;
    iconColor: string;
    percent: number;
}
export default React.memo(({ Icon, iconColor, percent }: IProps) => {
    const { blue } = useTheme();

    const RenderIcon = Icon || Icons.DeleteIcon;
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
