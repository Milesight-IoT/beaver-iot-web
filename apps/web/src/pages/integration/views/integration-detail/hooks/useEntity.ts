import { useCallback, useMemo } from 'react';
import { type IntegrationAPISchema } from '@/services/http';

/**
 * Entity data types in the integration
 */
export type InteEntityType = ObjectToCamelCase<
    IntegrationAPISchema['getDetail']['response']['integration_entities'][0]
>;

interface Props {
    entities?: InteEntityType[];
}

/**
 * Integrated entity Hooks
 */
const useEntity = ({ entities }: Props) => {
    const entityMap = useMemo(() => {
        const result: Record<string, InteEntityType> = {};

        entities?.forEach(item => {
            result[item.key] = item;
        });

        return result;
    }, [entities]);

    const getEntityKey = useCallback(
        (key: string) => {
            const entityKey = Object.keys(entityMap).find(item => item.includes(key));

            return entityKey;
        },
        [entityMap],
    );

    const getEntityValue = useCallback(
        (key: string) => {
            const entityKey = Object.keys(entityMap).find(item => item.includes(key));
            const entity = !entityKey ? undefined : entityMap[entityKey];

            return entity?.value;
        },
        [entityMap],
    );

    const getEntityValues = useCallback(
        <T extends string[]>(keys: T) => {
            const result: Partial<Record<T[number], any>> = {};

            keys.forEach(key => {
                const entityKey = Object.keys(entityMap).find(item => item.includes(key));
                const entity = !entityKey ? undefined : entityMap[entityKey];

                result[key as T[number]] = entity?.value;
            });

            return result;
        },
        [entityMap],
    );

    return {
        /**
         * Obtain the exact entity key based on the key keyword
         *
         * Note: If multiple entities contain the key keyword, the first matching entity key is returned
         */
        getEntityKey,

        /**
         * Obtain the exact entity value based on the key keyword
         *
         * Note: If multiple entities contain the key keyword, the value of the first matched entity is returned
         */
        getEntityValue,

        /**
         * Gets entity values from the keys keyword list
         *
         * Note: If multiple entities contain the key keyword, the value of the first matched entity is returned
         */
        getEntityValues,
    };
};

export default useEntity;
