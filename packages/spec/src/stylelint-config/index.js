const propertiesOrder = require('./properties-order');

module.exports = {
    // customSyntax: 'postcss-html',
    extends: ['stylelint-config-standard', 'stylelint-config-prettier'],
    plugins: ['stylelint-order'],
    overrides: [
        {
            files: ['**/*.(less|css|html|vue)'],
            customSyntax: 'postcss-less',
        },
        {
            files: ['**/*.(scss)'],
            customSyntax: 'postcss-scss',
        },
        {
            files: ['**/*.(html|vue)'],
            customSyntax: 'postcss-html',
        },
    ],
    rules: {
        // 缩进
        indentation: null,

        'font-family-name-quotes': null,

        'alpha-value-notation': null,

        'color-function-notation': null,

        'function-url-quotes': null,

        // css属性排序
        'order/properties-order': propertiesOrder,

        // 忽略rpx单位校验
        'unit-no-unknown': [true, { ignoreUnits: ['rpx'] }],

        'no-descending-specificity': null,

        // webcomponent
        'selector-type-no-unknown': null,

        // 允许空源，太过严格且有部分特殊写法。
        'no-empty-source': null,

        'font-family-no-missing-generic-family-keyword': null,

        'declaration-block-single-line-max-declarations': null,

        'declaration-block-no-duplicate-properties': [
            true,
            {
                ignore: 'consecutive-duplicates-with-different-values',
            },
        ],
        'selector-pseudo-class-no-unknown': [
            true,
            {
                ignorePseudoClasses: ['global', 'deep', 'local', 'export', 'v-deep', 'v-global'],
            },
        ],
        'selector-pseudo-element-no-unknown': [
            true,
            {
                ignorePseudoElements: ['v-deep', 'v-global'],
            },
        ],
        // 类名校验
        'selector-class-pattern': null,
        'order/order': [
            [
                'dollar-variables',
                'custom-properties',
                'at-rules',
                'declarations',
                {
                    type: 'at-rule',
                    name: 'supports',
                },
                {
                    type: 'at-rule',
                    name: 'media',
                },
                'rules',
            ],
            { severity: 'warning' },
        ],
        'at-rule-no-unknown': [
            true,
            {
                ignoreAtRules: [
                    '/^at-/',
                    'apply',
                    'variants',
                    'responsive',
                    'screen',
                    'function',
                    'if',
                    'each',
                    'include',
                    'mixin',
                    'extend',
                    'import',
                ],
            },
        ],
    },
    ignoreFiles: [
        'node_modules',
        '**/*.js',
        '**/*.jsx',
        '**/*.tsx',
        '**/*.ts',
        '**/*.mjs',
        '**/*.json',
        '**/*.md',
    ],
};
