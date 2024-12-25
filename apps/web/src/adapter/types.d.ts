export type Adapter = CustomComponentProps['adapter'];

export interface PluginProps<T = Record<string, any>> {
    config: T;
    configJson: CustomComponentProps;
}

export interface InjectStore {
    enableWs: boolean;
    refreshDeps: any[];
    searchParams: Record<string, any>;
}

export type SearchKeys = string[] | { key: string; value: string }[];

export interface Model<T = any, D = any> {
    useFetch: T;
    useReducer: D;
    searchKeys?: SearchKeys;
}
