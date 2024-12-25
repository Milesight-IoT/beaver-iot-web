export const parseStyleString = (styleString: string) => {
    return styleString.split(';').reduce((acc: any, style) => {
        const [property, value] = style.split(':').map(item => item.trim());
        if (property && value) {
            // 将CSS属性转换为驼峰命名法
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

    // 去掉字符串中的多余空格
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

// 将css转化为React的style命名
export const convertCssToReactStyle = (property: string) => {
    const camelCaseProperty = property.replace(/-([a-z])/g, (match, letter) =>
        letter.toUpperCase(),
    );
    return camelCaseProperty;
};
