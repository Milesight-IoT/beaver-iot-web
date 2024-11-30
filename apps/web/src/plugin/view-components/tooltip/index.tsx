import { Tooltip } from '@/components';
import { MSToolTipProps } from '@/components/tooltip';
import './style.less';

const pluginTooltip = (props: MSToolTipProps & { suffix?: React.ReactNode }) => {
    const { title, children, suffix, ...rest } = props;
    const renderContent = () => {
        if (suffix) {
            return (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    {title || children}
                    {suffix}
                </div>
            );
        }
        return <span className="plugin-view-tooltip-title">{title || children}</span>;
    };

    const renderTitle = () => {
        try {
            if (title) {
                return title;
            }
            if (children) {
                return (children as any)?.[0];
            }
            return null;
        } catch (error) {
            return null;
        }
    };

    return (
        <Tooltip {...rest} title={renderTitle()}>
            {renderContent()}
        </Tooltip>
    );
};

export default pluginTooltip;
