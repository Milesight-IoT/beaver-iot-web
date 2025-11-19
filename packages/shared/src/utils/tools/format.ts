/**
 * Formatting utilities (version, color, i18n, etc.)
 */
import intl from 'react-intl-universal';

/**
 * The version number comparative function, determine whether the first version number is
 * greater than or equal to the second version number
 * @param {String} version1 The first version number (supports 1.1, 1.2.3, V1.2.3 format)
 * @param {String} version2 The second version number (supports 1.1, 1.2.3, V1.2.3 format)
 */
export const compareVersions = (version1: string, version2: string) => {
    const ver1 = !version1.startsWith('v') ? version1 : version1.substring(1);
    const ver2 = !version2.startsWith('v') ? version2 : version2.substring(1);
    const parts1 = ver1.split('.');
    const parts2 = ver2.split('.');
    const length = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < length; i++) {
        const num1 = parseInt(parts1[i] || '0'); // Converted to integer, default 0
        const num2 = parseInt(parts2[i] || '0');

        if (num1 > num2) {
            return true;
        }
        if (num1 === num2) {
            if (i + 1 === length) return true;
            continue;
        }

        return false;
    }

    return false;
};

/**
 * Converts hexadecimal colors to rgba colors with transparency
 */
export const hexToRgba = (hex: string, alpha: number) => {
    // Remove the `#` sign from the front
    const color = hex.replace('#', '');

    // Converts hexadecimal colors to RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    // Returns the rgba color with transparency
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Text internationalization translation
 */
export const t = (key: string, options?: Record<number | string, any>) => {
    return intl.get(key, options).d(key);
};
