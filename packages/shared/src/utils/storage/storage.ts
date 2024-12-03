/**
 * localStorage, sessionStorage 封装，支持任意数据类型及自定义缓存时长
 */
import { DEFAULT_CACHE_PREFIX } from './constant';

interface IStorage {
    /** key 名前缀 */
    prefix?: string;
    /** 默认缓存时长，单位 ms（默认无限制，不主动清除缓存） */
    maxAge?: number | null;
    /** 缓存类型（localStorage | sessionStorage） */
    storage: Storage;
}

interface IData {
    /** 缓存 key */
    key: string;
    /** 缓存设置时的时间戳 */
    time: number;
    /** 缓存时长，单位 ms（默认无限制，不主动清除缓存） */
    maxAge?: IStorage['maxAge'];
    /** 缓存值 */
    value: any;
}

export class IotStorage implements IStorage {
    prefix: string;
    maxAge?: IStorage['maxAge'];
    storage: Storage;

    constructor({
        prefix = DEFAULT_CACHE_PREFIX,
        maxAge,
        storage = window.localStorage,
    }: IStorage) {
        this.prefix = prefix;
        this.maxAge = maxAge;
        this.storage = storage;
    }

    /** 设置值 */
    setItem(key: IData['key'], value: IData['value'], maxAge: IData['maxAge'] = this.maxAge) {
        const k = `${this.prefix}${key}`;
        const data: IData = {
            key: k,
            maxAge,
            time: Date.now(),
            value,
        };

        this.storage.setItem(k, JSON.stringify(data));
    }

    /** 获取值 */
    getItem<T = any>(key: IData['key']): T | undefined {
        const k = `${this.prefix}${key}`;
        const dataStr = this.storage.getItem(k) || '';
        let data: IData | undefined;

        try {
            data = JSON.parse(dataStr);
            // eslint-disable-next-line no-empty
        } catch (e) {}

        if (!dataStr || !data) return;

        let isExpired = false;
        if (data?.maxAge) {
            const expiredTime = data.time + data.maxAge;
            isExpired = expiredTime < Date.now();
        }

        if (isExpired) {
            this.storage.removeItem(k);
            return;
        }

        return data.value as T;
    }

    /** 删除值 */
    removeItem(key: IData['key']) {
        const k = `${this.prefix}${key}`;
        this.storage.removeItem(k);
    }

    /** 批量删除值 */
    removeItems(regex: RegExp) {
        const data = { ...this.storage };

        Object.keys(data).forEach(key => {
            const tempKey = key.replace(`${this.prefix}`, '');
            if (regex.test(tempKey)) this.removeItem(tempKey);
        });
    }

    /** 清空缓存（清空所有 msiot. 前缀的缓存） */
    clear() {
        const data = { ...this.storage };

        Object.keys(data).forEach(key => {
            const regex = new RegExp(`^${this.prefix}`);
            if (regex.test(key)) this.removeItem(key);
        });
    }
}
