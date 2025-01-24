import { sortBy, transform } from 'lodash';

/**
 * @description Sort the elements of an object in ascending order of dictionary size
 * @params keyvalues: json object
 * @params sortTarget: By default, objects are sorted according to the key of the keyvalues
 */
export const sort = (keyvalues: ObjType<string>, sortTarget: 'k' | 'v' = 'k') => {
    if (sortTarget === 'k') {
        // 1. Get all the keys
        const sortedKeys = Object.keys(keyvalues).sort();

        return sortedKeys.reduce<ObjType<string>>((acc, cur) => {
            acc[cur] = keyvalues[cur];
            return acc;
        }, {});
    }

    const arrKeyvalues = transform<ObjType<string>, Array<{ k: string; v: string }>>(
        keyvalues,
        (res, val, key) => {
            res.push({ k: String(key), v: val });
            return res;
        },
        [],
    );

    return sortBy(arrKeyvalues, item => item.v).reduce<ObjType<string>>((acc, cur) => {
        acc[cur.k] = cur.v;
        return acc;
    }, {});
};
