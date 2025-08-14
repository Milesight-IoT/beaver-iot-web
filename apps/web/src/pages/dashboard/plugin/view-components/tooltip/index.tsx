import { Tooltip } from '@/components';
import { MSToolTipProps } from '@/components/tooltip';
import './style.less';

const pluginTooltip = (props: MSToolTipProps) => {
    const { title, children, ...rest } = props;
    const renderContent = () => {
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
