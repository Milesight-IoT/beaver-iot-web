import { client, attachAPI, API_PREFIX } from './client';

/**
 * Blueprint source type
 * @template Default Default source type
 * @template Upload Upload source type
 */
export enum BlueprintSourceType {
    DEFAULT = 'DEFAULT',
    UPLOAD = 'UPLOAD',
}

/**
 * Blueprint type
 * @template ZIP ZIP
 * @template GITHUB GitHub
 */
export type BlueprintType = 'ZIP' | 'GITHUB';

export interface BlueprintAPISchema extends APISchema {
    /** Get blueprint setting */
    getSetting: {
        request: void;
        response: {
            type: BlueprintType;
            current_source_type: BlueprintSourceType;
            version: string;
            file_name?: string;
            update_time?: number;
            synced_success?: boolean;
            url?: string;
        };
    };

    /** Update blueprint setting */
    updateSetting: {
        request: {
            source_type: BlueprintSourceType;
            type?: BlueprintType;
            url?: string;
        };
        response: void;
    };
}

/**
 * Blueprint related API services
 */
export default attachAPI<BlueprintAPISchema>(client, {
    apis: {
        getSetting: `GET ${API_PREFIX}/blueprint-library-setting`,
        updateSetting: `POST ${API_PREFIX}/blueprint-library-setting`,
    },
});
