import { DEFAULT_CACHE_PREFIX } from './constant';
import { IotStorage } from './storage';
import { IndexedDBStorage } from './db-storage';
import { MMKVStorage } from './mmkv-storage';

/** localStorage */
const iotLocalStorage = new IotStorage({ storage: window.localStorage });

/** sessionStorage */
const iotSessionStorage = new IotStorage({ storage: window.sessionStorage });

/** indexDB 实例 */
const iotIndexedDBStorage = new IndexedDBStorage(`${DEFAULT_CACHE_PREFIX}db`);

/** mmkv 实例 */
const iotMMKVStorage = new MMKVStorage({ prefix: `${DEFAULT_CACHE_PREFIX}mmkv` });

export * from './constant';
export { iotLocalStorage, iotSessionStorage, iotIndexedDBStorage, iotMMKVStorage };
export default iotMMKVStorage;
