import type { AvatarProps } from '@mui/material';

/**
 * Generate color from string
 */
export function stringToColor(string: string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
}

/**
 * Generate avatar props
 */
export function genAvatarProps(name?: string, props?: Partial<AvatarProps>): Partial<AvatarProps> {
    if (!name) return {};
    const { sx, ...rest } = props || {};

    return {
        sx: {
            width: 28,
            height: 28,
            bgcolor: stringToColor(name),
            ...sx,
        },
        children: `${name.split(' ')[0][0]}`,
        ...rest,
    };
}
