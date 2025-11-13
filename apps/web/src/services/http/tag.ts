import { client, attachAPI, API_PREFIX } from './client';

export interface TagItemProps {
    id: ApiKey;
    name: string;
    color: string;
    description?: string;
    /** Count of entities tagged */
    tagged_entities_count: number;
    created_at: number;
}

export enum TagOperationEnums {
    'ADD' = 'ADD',
    'OVERWRITE' = 'OVERWRITE',
    'REMOVE' = 'REMOVE',
    'REPLACE' = 'REPLACE',
}

/**
 * Tag Management API
 */
export interface TagAPISchema extends APISchema {
    /** Get list */
    getTagList: {
        request: SearchRequestType & {
            keyword?: string;
        };
        response: SearchResponseType<TagItemProps[]>;
    };
    /** Get User added tag number */
    getTagNumberByUserAdded: {
        request: void;
        response: {
            number: number;
        };
    };
    /** Add tag */
    addTag: {
        request: {
            name: string;
            color: string;
            description?: string;
        };
        response: void;
    };
    /** Update tag */
    updateTag: {
        request: {
            tag_id: ApiKey;
            name: string;
            color: string;
            description?: string;
        };
        response: void;
    };
    /** Delete tag */
    deleteTag: {
        request: {
            ids: ApiKey[];
        };
        response: void;
    };
    /** Update entities tags */
    updateEntitiesTags: {
        request: {
            operation: TagOperationEnums;
            added_tag_ids?: ApiKey[];
            removed_tag_ids?: ApiKey[];
            entity_ids: ApiKey[];
        };
        response: void;
    };
}

/**
 * Tag-related API services
 */
export default attachAPI<TagAPISchema>(client, {
    apis: {
        getTagList: `POST ${API_PREFIX}/entity/tags/search`,
        getTagNumberByUserAdded: `GET ${API_PREFIX}/entity/tags/number`,
        addTag: `POST ${API_PREFIX}/entity/tags`,
        updateTag: `PUT ${API_PREFIX}/entity/tags/:tag_id`,
        deleteTag: `POST ${API_PREFIX}/entity/tags/delete`,
        updateEntitiesTags: `POST ${API_PREFIX}/entity/tags/mapping`,
    },
});
