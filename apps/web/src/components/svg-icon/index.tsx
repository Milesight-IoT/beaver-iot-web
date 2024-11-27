import React from 'react';

export interface SvgIconProps extends React.SVGProps<SVGSVGElement> {
    name: string;
    prefix?: string;
    color?: string;
}

const SvgIcon: React.FC<SvgIconProps> = props => {
    const { name, prefix = 'icon', color = 'currentColor', ...restProps } = props;

    const symbolId = `#${prefix}-${name}`;

    return (
        <svg {...restProps} aria-hidden="true">
            <use href={symbolId} fill={color} />
        </svg>
    );
};

export default SvgIcon;
