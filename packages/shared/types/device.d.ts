/**
 * Device Data Model
 */
declare interface DeviceSchema {
    /** Device ID */
    id: ApiKey;

    /** Device Key */
    key: ApiKey;

    /** Device Name */
    name: string;

    /** Integration ID */
    integration: string;

    /** External ID for Integration */
    external_id: ApiKey;

    /** Additional Data */
    additional_data?: any;

    /** Creation Times (ms) */
    created_at: number;

    /** Update Time (ms) */
    update_at: number;
}
