import React from 'react';
import * as Icons from '@milesight/shared/src/components/icons';
import { useTheme } from '@milesight/shared/src/hooks';
import './style.less';

interface IProps {
    Icon: any;
    color: string;
    percent: number;
}
export default React.memo(({ Icon, color, percent }: IProps) => {
    const { purple } = useTheme();

    const RenderIcon = Icon || Icons.DeleteIcon;
    const renderColor = color || purple[700];
    return (
        <div className="ms-remain-chart">
            {RenderIcon && (
                <div className="ms-remain-chart__content">
                    <div className="ms-remain-chart__icon">
                        <RenderIcon />
                    </div>
                    <div className="ms-remain-chart__progress">
                        <div
                            className="ms-remain-chart__progress-bar"
                            style={{
                                // @ts-ignore
                                '--remain-percent': `${percent || 0}%`,
                                '--remain-color': renderColor,
                            }}
                        />
                    </div>
                    <div className="ms-remain-chart__percent">{`${percent || 0}%`}</div>
                </div>
            )}
        </div>
    );
});
