import { useMemo } from 'react';
import { isEmpty } from 'lodash-es';

export function useEntityOptions(
    tagOptions: TagProps[],
    selectedEntities?: ObjectToCamelCase<EntityData>[],
) {
    const entityOptions: TagProps[] = useMemo(() => {
        if (!Array.isArray(selectedEntities) || isEmpty(selectedEntities)) {
            return [];
        }

        const newTags: Map<ApiKey, TagProps> = new Map();
        selectedEntities.forEach(entity => {
            (entity?.entityTags || []).forEach(tag => {
                /**
                 * Entities tag existed tag options
                 */
                const tagIsExisted = (tagOptions || []).find(t => t.id === tag.id);
                if (tag?.id && tagIsExisted && !newTags.has(tag.id)) {
                    newTags.set(tag.id, tag);
                }
            });
        });

        return Array.from(newTags.values());
    }, [tagOptions, selectedEntities]);

    return {
        entityOptions,
    };
}
