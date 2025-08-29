import type { CustomControlItem } from '@/components/drawing-board/plugin/types';

export const parseStyleString = (styleString: string) => {
    return styleString.split(';').reduce((acc: any, style) => {
        const [property, value] = style.split(':').map(item => item.trim());
        if (property && value) {
            // Convert the CSS attribute to the hump naming method
            const camelCaseProperty = property.replace(/-([a-z])/g, (match, letter) =>
                letter.toUpperCase(),
            );
            acc[camelCaseProperty] = value;
        }
        return acc;
    }, {});
};

export const parseStyleToReactStyle = (styleString: string) => {
    const styleObject: any = {};

    // Remove the excess space in the string
    const styleArray = styleString.split(';').map(style => style.trim());

    styleArray.forEach(style => {
        if (style) {
            const [property, value] = style.split(':').map(item => item.trim());
            const camelCaseProperty = property.replace(/-([a-z])/g, (match, letter) =>
                letter.toUpperCase(),
            );
            styleObject[camelCaseProperty] = value;
        }
    });

    return styleObject;
};

// Convert CSS to the style of React
export const convertCssToReactStyle = (property: string) => {
    const camelCaseProperty = property.replace(/-([a-z])/g, (match, letter) =>
        letter.toUpperCase(),
    );
    return camelCaseProperty;
};

// Judge Whether is custom control item
export const isCustomControlItem = (obj: unknown): obj is CustomControlItem =>
    typeof obj === 'object' &&
    obj !== null &&
    typeof ('name' in obj && obj.name) === 'string' &&
    typeof ('config' in obj && obj.config) === 'object' &&
    (obj as CustomControlItem).config !== null;
