import React, { useEffect, useRef, useState } from 'react';
import cls from 'classnames';
import { useSize, useDebounceEffect } from 'ahooks';
import { Tooltip as MTooltip, type TooltipProps } from '@mui/material';
import './style.less';

export interface MSToolTipProps extends Omit<TooltipProps, 'children'> {
    /** 是否基于内容及容器宽度自动开启 */
    autoEllipsis?: boolean;

    /** 引用元素 */
    children?: React.ReactElement;
}

/**
 * Tooltip 组件
 *
 * 可根据内容及容器宽度自动处理文案省略，当省略时，鼠标移到文案上 Tooltip 显示完整文案
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

    // title 变更时，触发重新计算内容宽度
    useEffect(() => {
        setContWidth(null);
    }, [title]);

    // 判断内容宽度是否超出容器宽度，超出则显示 Tooltip
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
