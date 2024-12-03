import { sortBy, transform } from 'lodash';

/**
 * @description 将对象内的元素按照字典大小升序排序
 * @params keyvalues: json对象
 * @params sortTarget: 排序的对象，默认是按照keyvalues的key来排序
 */
export const sort = (keyvalues: ObjType<string>, sortTarget: 'k' | 'v' = 'k') => {
    if (sortTarget === 'k') {
        // 1. 拿到所有的key
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
