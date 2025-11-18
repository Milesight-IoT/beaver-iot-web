/**
 * Random generation utilities
 */

/**
 * Generate UUID
 * @returns UUID
 */
export const generateUUID = (): string => {
    if (window?.crypto?.randomUUID) return window.crypto.randomUUID();

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        // eslint-disable-next-line no-bitwise
        const random = (Math.random() * 16) | 0;
        // eslint-disable-next-line no-bitwise
        return (c === 'x' ? random : (random & 0x3) | 0x8).toString(16);
    });
};

interface GenerateStrOPtions {
    /** Whether contain uppercase letters */
    upperCase?: boolean;
    /** Whether contain lowercase letters */
    lowerCase?: boolean;
    /** Whether contain numbers */
    number?: boolean;
    /** Whether contain symbols */
    symbol?: boolean;
}
/**
 * Generate random string
 * @param {number} length String length, default is 8
 * @param {Object} [options] Options
 * @param {boolean} options.number Whether contain uppercase letters, default is `true`
 * @param {boolean} options.upperCase Whether contain uppercase letters, default is `true`
 * @param {boolean} options.lowerCase Whether contain lowercase letters, default is `false`
 * @param {boolean} options.symbol Whether contain symbols, default is `false`
 * @returns {string}
 */
export const genRandomString = (
    length = 8,
    options: GenerateStrOPtions = { upperCase: true, number: true },
): string => {
    const getCharacters = () => {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        const strategy: Record<keyof GenerateStrOPtions, string> = {
            upperCase: letters.toUpperCase(),
            lowerCase: letters,
            number: numbers,
            symbol: symbols,
        };
        if (options) {
            return Object.keys(options)
                .filter(key => options[key as keyof GenerateStrOPtions])
                .map(key => strategy[key as keyof GenerateStrOPtions])
                .join('');
        }

        return Object.values(strategy).join('');
    };
    const characters = getCharacters();

    return new Array(length)
        .fill(0)
        .map(() => characters[Math.floor(Math.random() * characters.length)])
        .join('');
};
