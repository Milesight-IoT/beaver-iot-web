/**
 * 实体访问模式
 * @param R 只读
 * @param W 只写
 * @param RW 读写
 */
declare type EntityAccessMode = 'R' | 'W' | 'RW';

/**
 * 实体类型
 * @param SERVICE 服务
 * @param PROPERTY 属性
 * @param EVENT 事件
 */
declare type EntityType = 'SERVICE' | 'PROPERTY' | 'EVENT';

/**
 * 物模型属性数据类型
 */
declare type EntityValueDataType =
    | 'STRING'
    | 'LONG'
    | 'DOUBLE'
    | 'BOOLEAN'
    | 'BINARY'
    | 'OBJECT'
    | 'ENUM';

/**
 * 数据聚合类型
 * @param LAST 最新一条
 * @param MIN 最小值
 * @param MAX 最大值
 * @param AVG 平均值
 * @param SUM 累计值
 * @param COUNT 统计条数
 */
declare type DataAggregateType = 'LAST' | 'MIN' | 'MAX' | 'AVG' | 'SUM' | 'COUNT';

/**
 * 实体数据模型
 */
declare interface EntitySchema {
    /** 实体 ID */
    id: ApiKey;

    /** 实体 Key */
    key: ApiKey;

    /** 实体名称 */
    name: string;

    /** 实体类型 */
    type: EntityType;

    /** 访问模式 */
    access_mod: EntityAccessMode;

    /** 是否同步调用服务 */
    sync_call: boolean;

    /** 父节点 ID */
    parent_id: ApiKey;

    /** 隶属对象 */
    attach_target: string;

    /** 隶属对象 ID */
    attach_target_id: ApiKey;

    /** 实体值属性 */
    value_attribute: any;

    /** 实体值类型 */
    value_type: string;

    /** 创建时间 */
    create_at: number;

    /** 更新时间 */
    update_at: number;
}

/** 实体属性类型 */
declare interface EntityValueAttributeType {
    /** 单位 */
    unit: string;
    /** 最大值 */
    max: number;
    /** 最小值 */
    min: number;
    /** 最大长度 */
    max_length: number;
    /** 最小长度 */
    min_length: number;
    /** 枚举 */
    enum: Record<string, string>;
    /** 格式 */
    format: string;
    /** 精度 */
    fraction_digits: number;
}

/** 实体数据 */
declare interface EntityData {
    /** 实体 id */
    entity_id: ApiKey;
    /** 设备名称 */
    device_name: string;
    /** 集成名称 */
    integration_name: string;
    /** 实体key */
    entity_key: string;
    /** 实体名称 */
    entity_name: string;
    /** Entity Type */
    entity_type: EntityType;
    /** 实体值属性 */
    entity_value_attribute: Record<string, any>;
    /** 实体值类型 */
    entity_value_type: EntityValueDataType;
    /** 实体属性访问类型 */
    entity_access_mod: EntityAccessMode;
    /** 唯一表示 */
    identifier: string;
    /** 父实体名称 */
    entity_parent_name?: string;
}

/**
 * 实体历史数据
 */
declare interface EntityHistoryData {
    value: any;
    timestamp: number;
    value_type: EntityValueDataType;
}
