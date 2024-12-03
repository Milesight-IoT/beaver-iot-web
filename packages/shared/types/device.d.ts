/**
 * 设备数据模型
 */
declare interface DeviceSchema {
    /** 设备 ID */
    id: ApiKey;

    /** 设备 Key */
    key: ApiKey;

    /** 设备名称 */
    name: string;

    /** 来源集成 ID */
    integration: string;

    /** 集成外部 ID */
    external_id: ApiKey;

    /** 额外数据 */
    additional_data?: any;

    /** 创建时间 */
    create_at: number;

    /** 更新时间 */
    update_at: number;
}
