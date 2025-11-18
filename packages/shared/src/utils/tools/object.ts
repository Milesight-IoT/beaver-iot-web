/**
 * Object manipulation utilities
 */

/**
 * Get Object type
 * @param obj Any object
 * @returns
 */
export const getObjectType = (obj: any) => {
    const typeString = Object.prototype.toString.call(obj);
    const matched = typeString.match(/^\[object\s(\w+)\]$/);
    const type = matched && matched[1].toLocaleLowerCase();

    return type;
};

/**
 * The nested object is expanded as a flat object, where the nested keys are connected
 * through the point number.
 *
 * @param obj The Object to be flattened
 * @returns
 *
 * @example
 * const nestedObj = { a: { b: { c: 1 } } };
 * const flattenedObj = flattenObject(nestedObj);
 * // flattenedObj -> { 'a.b.c': 1 }
 */
export function flattenObject<T extends Record<string, any>>(obj: T) {
    const result: Record<string, any> = {};

    for (const i in obj) {
        if (typeof obj[i] === 'object' && !Array.isArray(obj[i])) {
            const temp = flattenObject(obj[i]);
            // eslint-disable-next-line guard-for-in
            for (const j in temp) {
                result[`${i}.${j}`] = temp[j];
            }
        } else {
            result[i] = obj[i];
        }
    }

    return result;
}
