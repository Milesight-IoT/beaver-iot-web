export const getRange = (entity: EntityOptionType) => {
    const { rawData } = entity || {};
    const { entityValueAttribute } = rawData || {};
    const { min, max, min_length: minLength, max_length: maxLength } = entityValueAttribute || {};

    return {
        min: min ?? minLength,
        max: max ?? maxLength,
    };
};
