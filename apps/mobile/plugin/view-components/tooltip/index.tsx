import { Box, Tooltip, Text } from '@ms-mobile-ui/themed';
import React from 'react';

interface MSToolTipProps {
    title?: string;
    children?: React.ReactNode;
    placement?: 'bottom' | 'top' | 'right' | 'left' | 'top left' | 'top right' | 'bottom left' | 'bottom right' | 'right top' | 'right bottom' | 'left top' | 'left bottom';
    isOpen?: boolean;
    isDisabled?: boolean;
    defaultIsOpen?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    openDelay?: number;
    closeDelay?: number;
    closeOnClick?: boolean;
    offset?: number;
    crossOffset?: number;
    shouldOverlapWithTrigger?: boolean;
    shouldFlip?: boolean;
    closeOnOverlayClick?: boolean;
}

const PluginTooltip = (props: MSToolTipProps) => {
    const { title, children, ...rest } = props;

    const renderContent = () => {
        return <Text numberOfLines={1} >{title || children}</Text>;
    };

    const renderTitle = () => {
        try {
            if (title) {
                return title;
            }
            if (children) {
                return React.Children.toArray(children)[0];
            }
            return null;
        } catch (error) {
            return null;
        }
    };

    return (
        <Tooltip
            {...rest}
            trigger={(triggerProps) => (
                <Box {...triggerProps}>
                    {renderContent()}
                </Box>
            )}
        >
            <Tooltip.Content>
                <Tooltip.Text>{renderTitle()}</Tooltip.Text>
            </Tooltip.Content>
        </Tooltip>
    );
};



export default PluginTooltip;
