import { useCallback, useMemo } from 'react';
import { type IntegrationAPISchema } from '@/services/http';

/**
 * 集成中的实体数据类型
 */
export type InteEntityType = ObjectToCamelCase<
    IntegrationAPISchema['getDetail']['response']['integration_entities'][0]
>;

interface Props {
    entities?: InteEntityType[];
}

/**
 * 集成实体 Hooks
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
         * 根据 key 关键字获取准确实体 key
         *
         * 注意：若多个实体中均包含 key 关键字，则返回第一个匹配的实体 key
         */
        getEntityKey,

        /**
         * 根据 key 关键字获取准确实体 value
         *
         * 注意：若多个实体中均包含 key 关键字，则返回第一个匹配的实体 value
         */
        getEntityValue,

        /**
         * 根据 keys 关键字列表获取实体 values
         *
         * 注意：若多个实体中均包含 key 关键字，则返回第一个匹配的实体 value
         */
        getEntityValues,
    };
};

export default useEntity;
