import reduceHexValue from './helpers/reduceHexValue';
import toHex from './helpers/numberToHex';

import type { RgbColor } from './types/color';

/**
 * Returns a string value for the color. The returned result is the smallest possible hex notation.
 *
 * @example
 * 1. Styles as object usage
 * const styles = {
 *   background: rgb(255, 205, 100),
 *   background: rgb({ red: 255, green: 205, blue: 100 }),
 * }
 *
 * 2. styled-components usage
 * const div = styled.div`
 *   background: ${rgb(255, 205, 100)};
 *   background: ${rgb({ red: 255, green: 205, blue: 100 })};
 * `
 *
 * 3. CSS in JS Output
 *
 * element {
 *   background: "#ffcd64";
 *   background: "#ffcd64";
 * }
 */
export default function rgb(
    value: RgbColor | number,
    green?: number,
    blue?: number,
): string | undefined {
    if (typeof value === 'number' && typeof green === 'number' && typeof blue === 'number') {
        return reduceHexValue(`#${toHex(value)}${toHex(green)}${toHex(blue)}`);
    }
    if (typeof value === 'object' && green === undefined && blue === undefined) {
        return reduceHexValue(`#${toHex(value.red)}${toHex(value.green)}${toHex(value.blue)}`);
    }
}
