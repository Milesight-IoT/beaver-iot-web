import React, { useEffect, useRef, useState } from 'react';
import cls from 'classnames';
import { useSize, useDebounceEffect } from 'ahooks';
import { Tooltip as MTooltip, type TooltipProps } from '@mui/material';
import './style.less';

export interface MSToolTipProps extends Omit<TooltipProps, 'children'> {
    /** Whether to open automatically based on content and container width */
    autoEllipsis?: boolean;

    /** Reference element */
    children?: React.ReactElement;
}

/**
 * Tooltip component
 *
 * Copy omissions can be automatically processed based on the content and container width. When omitted, the mouse cursor moves over the copy and the Tooltip displays the full copy
 */
const Tooltip: React.FC<MSToolTipProps> = ({
    autoEllipsis,
    className,
    title,
    children,
    ...props
}) => {
    const wrapRef = useRef<HTMLDivElement>(null);
    const contRef = useRef<HTMLDivElement>(null);
    const [innerTitle, setInnerTitle] = useState<React.ReactNode>(title);
    const [contWidth, setContWidth] = useState<number | null>(null);
    const wrapSize = useSize(wrapRef);
    const contSize = useSize(contRef);

    useEffect(() => {
        if (!autoEllipsis || !contSize?.width) return;
        setContWidth(contSize.width);
    }, [autoEllipsis, contSize]);

    // When title changes, a recalculation of the content width is triggered
    useEffect(() => {
        setContWidth(null);
    }, [title]);

    // Determine if the content width exceeds the container width. If it does, Tooltip is displayed
    useDebounceEffect(
        () => {
            if (!autoEllipsis || !contWidth || !wrapSize?.width) {
                setInnerTitle(title);
                return;
            }

            if (contWidth > wrapSize.width) {
                setInnerTitle(title);
            } else {
                setInnerTitle(null);
            }
        },
        [autoEllipsis, title, contWidth, wrapSize?.width],
        { wait: 300 },
    );

    children = children || <span className="ms-tooltip-cont">{title}</span>;

    return (
        <div className={cls('ms-tooltip', className)} ref={wrapRef}>
            <MTooltip
                placement="top"
                title={innerTitle}
                enterDelay={300}
                enterNextDelay={300}
                {...props}
            >
                {children}
            </MTooltip>
            {autoEllipsis && !contWidth && (
                <div className="ms-tooltip-virtual-cont" ref={contRef}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default Tooltip;
