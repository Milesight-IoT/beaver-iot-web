/**
 * Number formatting utilities
 */

/**
 * Digital thousands of separators
 * @param number Number to be separated
 * @param separator Separator, default is `,`
 */
export const thousandSeparate = (number?: number | string, separator = ',') => {
    if (!number && number !== 0) return '';

    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

/**
 * Transform the size in bytes to a human-readable string.
 * @param size Size in bytes
 * @returns Human-readable size string
 */
export function getSizeString(size: number, decimalPlaces = 2) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(decimalPlaces)} ${units[unitIndex]}`;
}

/**
 * Format map coordinate precision
 * @param value The coordinate value to be formatted (number or string)
 * @param options Optional configuration
 * @param options.precision Number of decimal places to retain (default: 6)
 * @param options.round Whether to round the result (default: true)
 * @param options.padZeros Whether to pad with zeros when decimal places are insufficient (default: true)
 * @param options.resultType The type of the returned result ('string' or 'number')
 * @returns Formatted coordinate value with type determined by resultType
 */
export function formatPrecision<T extends 'string' | 'number' = 'string'>(
    value: number | string,
    options?: {
        precision?: number;
        round?: boolean;
        padZeros?: boolean;
        resultType?: T;
    },
): T extends 'number' ? number : string {
    // Default configuration
    const {
        precision = 6,
        round = true,
        padZeros = true,
        resultType = 'string' as T,
    } = options || {};

    // Parameter validation
    if (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '')
    ) {
        throw new Error('Value must be a valid number or non-empty string');
    }

    if (!Number.isInteger(precision) || precision < 0) {
        throw new Error('Precision must be a non-negative integer');
    }

    // Convert string value to number
    let numValue: number;
    if (typeof value === 'string') {
        const parsedValue = parseFloat(value);
        if (isNaN(parsedValue)) {
            throw new Error('String value must be parsable to a number');
        }
        numValue = parsedValue;
    } else {
        numValue = value;
    }

    let result: string;

    if (round) {
        // Rounding mode - using toFixed method
        result = numValue.toFixed(precision);
    } else {
        // Truncation mode - no rounding
        const multiplier = 10 ** precision;
        const truncatedValue = Math.trunc(numValue * multiplier) / multiplier;
        result = truncatedValue.toString();

        // Handle zero padding logic
        if (padZeros) {
            const parts = result.split('.');
            if (parts.length === 1) {
                // No decimal part, add decimal point and zeros
                result = `${result}.${'0'.repeat(precision)}`;
            } else {
                // Decimal part is insufficient, pad with zeros
                const decimalPart = parts[1];
                if (decimalPart.length < precision) {
                    result = `${parts[0]}.${decimalPart}${'0'.repeat(precision - decimalPart.length)}`;
                }
            }
        }
    }

    // If zero padding is not needed and the result is an integer, remove the decimal part
    if (!padZeros && result.includes('.') && parseInt(result.split('.')[1]) === 0) {
        result = result.split('.')[0];
    }

    // Return according to specified result type
    if (resultType === 'number') {
        return parseFloat(result) as T extends 'number' ? number : string;
    }

    // Return string to ensure precision and format control
    return result as T extends 'number' ? number : string;
}
