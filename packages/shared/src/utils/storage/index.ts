import { DEFAULT_CACHE_PREFIX } from './constant';
import { IotStorage } from './storage';
import { IndexedDBStorage } from './db-storage';

/** localStorage */
const iotLocalStorage = new IotStorage({ storage: window.localStorage });

/** sessionStorage */
const iotSessionStorage = new IotStorage({ storage: window.sessionStorage });

/** indexDB 实例 */
const iotIndexedDBStorage = new IndexedDBStorage(`${DEFAULT_CACHE_PREFIX}db`);

export * from './constant';
export { iotLocalStorage, iotSessionStorage, iotIndexedDBStorage };
export default iotLocalStorage;
