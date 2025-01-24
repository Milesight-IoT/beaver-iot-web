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
        // retract
        indentation: null,

        'font-family-name-quotes': null,

        'alpha-value-notation': null,

        'color-function-notation': null,

        'function-url-quotes': null,

        // css property sorting
        'order/properties-order': propertiesOrder,

        // Ignore the rpx unit check
        'unit-no-unknown': [true, { ignoreUnits: ['rpx'] }],

        'no-descending-specificity': null,

        // webcomponent
        'selector-type-no-unknown': null,

        // Allow empty source, too strict and some special writing.
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
        // Class name check
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
        'function-no-unknown': [
            true,
            {
                ignoreFunctions: ['fade'],
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
