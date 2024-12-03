const path = require('path');

require('./patch');

module.exports = {
    extends: [path.join(__dirname, '../base/index.js')],
    overrides: [
        {
            files: ['*.ts'],
            extends: [
                'airbnb-base',
                'plugin:@typescript-eslint/recommended',
                'plugin:prettier/recommended',
                'prettier',
            ],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                // project: ['./tsconfig.json'], // Specify it only for TypeScript files
                ecmaFeatures: {
                    impliedStrict: true,
                },
                ecmaVersion: 2020,
            },
            rules: {
                ...require('../rules').javascript,
                ...require('../rules').typescript,
                'prettier/prettier': [
                    2,
                    {
                        ...require('../../prettier-config'),
                    },
                ],
            },
            settings: {
                'import/parsers': {
                    '@typescript-eslint/parser': ['.ts'],
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
