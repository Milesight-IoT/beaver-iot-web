/**
 * indexDB 封装
 */
interface OptionsType {
    /** 数据库名称 */
    dbName?: string;
    /** store 名称 */
    storeName: string;
    /** 版本号，必须为 64 位整数 */
    version?: number;
    /** 主键，默认为 id */
    keyPath?: string | string[];
    /** 索引 */
    indexs?: Record<
        string,
        IDBIndexParameters & {
            keyPath?: string | string[];
        }
    >;
}

export class IndexedDBStorage {
    private dbName: OptionsType['dbName'];
    private storeName?: OptionsType['storeName'];
    private db: IDBDatabase | null = null;

    constructor(dbName: string) {
        this.dbName = dbName;
    }

    /**
     * 初始化 IndexedDB 数据库
     */
    async init({
        dbName = this.dbName,
        storeName,
        version = 1,
        keyPath = 'id',
        indexs,
    }: OptionsType): Promise<void> {
        return new Promise((resolve, reject) => {
            this.dbName = dbName;
            this.storeName = storeName;
            const request = window.indexedDB.open(dbName!, version);

            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(storeName)) {
                    const store = db.createObjectStore(storeName, { keyPath });

                    Object.entries(indexs || {}).forEach(([key, config]) => {
                        store.createIndex(key, config.keyPath || key, config);
                    });
                } else {
                    const store = request.transaction?.objectStore(storeName);

                    Object.entries(indexs || {}).forEach(([key, config]) => {
                        if (store?.indexNames.contains(key)) {
                            store?.deleteIndex(key);
                        }
                        store?.createIndex(key, config.keyPath || key, config);
                    });
                }
            };

            request.onsuccess = (event: Event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve();
            };

            request.onerror = (event: Event) => {
                reject((event.target as IDBOpenDBRequest).error);
            };
        });
    }

    async addItem<T extends Record<string, any>>(data: T, ttl?: number): Promise<void> {
        const { db, storeName } = this;
        if (!db || !storeName) {
            console.warn('Please init the IndexedDBStorage first');
            return;
        }

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);

            if (ttl) {
                data = { ...data, expiry: Date.now() + ttl };
            }

            const request = store.add(data);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event: Event) => {
                reject((event.target as IDBRequest).error);
            };
        });
    }

    /**
     * 更新数据
     */
    async putItem<T extends Record<string, any>>(
        data: T,
        key: string,
        ttl?: number,
    ): Promise<void> {
        const { db, storeName } = this;
        if (!db || !storeName) {
            console.warn('Please init the IndexedDBStorage first');
            return;
        }

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);

            if (ttl) {
                data = { ...data, expiry: Date.now() + ttl };
            }

            const request = store.put(data, key);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event: Event) => {
                reject((event.target as IDBRequest).error);
            };
        });
    }

    /**
     * 删除单条数据（仅支持通过主键删除）
     * @param keyValue 主键值
     */
    async removeItem(keyValue: ApiKey): Promise<boolean> {
        const { db, storeName } = this;
        if (!db || !storeName) {
            console.warn('Please init the IndexedDBStorage first');
            return false;
        }

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(keyValue);

            request.onsuccess = (_: Event) => {
                resolve(true);
            };

            request.onerror = (event: Event) => {
                reject((event.target as IDBRequest).error);
            };
        });
    }

    /**
     * 删除多条数据
     * @param key 搜索键
     * @param values 搜索键值（若未传值则会删除所有数据）
     */
    async removeItems(key: string, values: ApiKey | ApiKey[]): Promise<boolean> {
        const { db, storeName } = this;
        if (!db || !storeName) {
            console.warn('Please init the IndexedDBStorage first');
            return false;
        }

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.index(key).openCursor();
            const query = Array.isArray(values) ? values : [values];

            request.onsuccess = (event: Event) => {
                const cursor = (event.target as IDBRequest).result;

                if (cursor) {
                    const value = cursor.value?.[key];

                    if (query.includes(value)) cursor.delete();
                    cursor.continue();
                } else {
                    // No more matching records
                    resolve(true);
                }
            };

            request.onerror = (event: Event) => {
                reject((event.target as IDBRequest).error);
            };
        });
    }

    /**
     * 获取当前 Store 下指定条件的所有数据
     * @param key 搜索键
     * @param query 搜索条件
     * @param direction 取值顺序（默认 `prev`，从最后位置开始取值）
     */
    async getItems<T extends Record<string, any>[]>(
        key = 'id',
        query?: IDBValidKey | IDBKeyRange | null,
        direction?: IDBCursorDirection,
    ): Promise<T | null> {
        const { db, storeName } = this;
        if (!db || !storeName) {
            console.warn('Please init the IndexedDBStorage first');
            return null;
        }

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.index(key).openCursor(query, direction);
            const result = [] as unknown as T;

            request.onsuccess = (event: Event) => {
                const cursor = (event.target as IDBRequest).result;
                if (cursor) {
                    result.push(cursor.value);
                    cursor.continue();
                } else {
                    // No more matching records
                    resolve(result);
                }
            };

            request.onerror = (event: Event) => {
                reject((event.target as IDBRequest).error);
            };
        });
    }

    /**
     * 清空当前 Store 数据，清除成功时返回 `true`
     */
    async clear(): Promise<boolean> {
        const { db, storeName } = this;
        if (!db || !storeName) {
            console.warn('Please init the IndexedDBStorage first');
            return false;
        }

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => {
                resolve(true);
            };

            request.onerror = (event: Event) => {
                console.log(event);
                reject((event.target as IDBRequest).error);
            };
        });
    }
}
