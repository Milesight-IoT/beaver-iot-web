const path = require('path');

require('./patch');

module.exports = {
    extends: [path.join(__dirname, '../react/index.js')],
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            extends: [
                'airbnb',
                'airbnb/hooks',
                'plugin:@typescript-eslint/recommended',
                'plugin:prettier/recommended',
                'prettier',
            ],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                ecmaFeatures: {
                    impliedStrict: true,
                    jsx: true,
                },
                ecmaVersion: 2020,
            },
            rules: {
                ...require('../rules').javascript,
                ...require('../rules').typescript,
                ...require('../rules').javascriptReact,
                'prettier/prettier': [
                    2,
                    {
                        ...require('../../prettier-config'),
                    },
                ],

                // Support ts-ignore comment
                '@typescript-eslint/ban-ts-comment': 0,

                '@typescript-eslint/no-unused-expressions': 0,

                'import/no-unresolved': 0,
                'import/no-absolute-path': 0,
            },
            settings: {
                react: {
                    version: '18.3.1',
                },
                'import/parsers': {
                    '@typescript-eslint/parser': ['.ts', '.tsx'],
                },
                'import/resolver': {
                    // use <root>/tsconfig.json
                    typescript: {
                        alwaysTryTypes: true, // always try to resolve types under `<root>/@types` directory even it doesn't contain any source code, like `@types/unist`
                    },
                },
            },
        },
    ],
};
