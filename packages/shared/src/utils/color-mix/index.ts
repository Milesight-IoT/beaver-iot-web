import rgba from './rgba';
import parseToRgb from './parseToRgb';

import type { RgbaColor } from './types/color';

/**
 * Mixes the two provided colors together by calculating the average of each of the RGB components weighted to the first color by the provided weight.
 *
 * @example
 * 1. Styles as object usage
 * const styles = {
 *   background: mix(0.5, '#f00', '#00f')
 *   background: mix(0.25, '#f00', '#00f')
 *   background: mix('0.5', 'rgba(255, 0, 0, 0.5)', '#00f')
 * }
 *
 * 2. styled-components usage
 * const div = styled.div`
 *   background: ${mix(0.5, '#f00', '#00f')};
 *   background: ${mix(0.25, '#f00', '#00f')};
 *   background: ${mix('0.5', 'rgba(255, 0, 0, 0.5)', '#00f')};
 * `
 *
 * 3. CSS in JS Output
 *
 * element {
 *   background: "#7f007f";
 *   background: "#3f00bf";
 *   background: "rgba(63, 0, 191, 0.75)";
 * }
 */
export default function mix(
    weight: number | string,
    color: string,
    otherColor: string,
): string | undefined {
    if (color === 'transparent') return otherColor;
    if (otherColor === 'transparent') return color;
    if (weight === 0) return otherColor;

    const parsedColor1 = parseToRgb(color);
    if (!parsedColor1) return;

    const color1 = {
        ...parsedColor1,
        alpha:
            typeof (parsedColor1 as RgbaColor)?.alpha === 'number'
                ? (parsedColor1 as RgbaColor).alpha
                : 1,
    };

    const parsedColor2 = parseToRgb(otherColor);
    if (!parsedColor2) return;

    const color2 = {
        ...parsedColor2,
        alpha:
            typeof (parsedColor2 as RgbaColor)?.alpha === 'number'
                ? (parsedColor2 as RgbaColor).alpha
                : 1,
    };

    // The formula is copied from the original Sass implementation:
    // http://sass-lang.com/documentation/Sass/Script/Functions.html#mix-instance_method
    const alphaDelta = color1.alpha - color2.alpha;
    const x = parseFloat(String(weight)) * 2 - 1;
    const y = x * alphaDelta === -1 ? x : x + alphaDelta;
    const z = 1 + x * alphaDelta;
    const weight1 = (y / z + 1) / 2.0;
    const weight2 = 1 - weight1;

    const mixedColor = {
        red: Math.floor(color1.red * weight1 + color2.red * weight2),
        green: Math.floor(color1.green * weight1 + color2.green * weight2),
        blue: Math.floor(color1.blue * weight1 + color2.blue * weight2),
        alpha:
            color1.alpha * parseFloat(String(weight)) +
            color2.alpha * (1 - parseFloat(String(weight))),
    };

    return rgba(mixedColor);
}
