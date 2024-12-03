require('./patch');

module.exports = {
    overrides: [
        {
            files: ['*.jsx', '*.js'],
            extends: ['airbnb', 'airbnb/hooks', 'plugin:prettier/recommended', 'prettier'],
            parserOptions: {
                ecmaFeatures: {
                    impliedStrict: true,
                    jsx: true,
                },
                ecmaVersion: 2020,
            },
            rules: {
                ...require('../rules').javascript,
                ...require('../rules').javascriptReact,
                'prettier/prettier': [
                    2,
                    {
                        ...require('../../prettier-config'),
                    },
                ],
            },
            settings: {
                react: {
                    version: 'detect',
                },
            },
        },
    ],
};
