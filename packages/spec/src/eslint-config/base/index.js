const path = require('path');

require('./patch');

module.exports = {
    extends: [path.join(__dirname, 'name.js')],
    overrides: [
        {
            files: ['*.js'],
            extends: ['airbnb-base', 'plugin:prettier/recommended', 'prettier'],
            parserOptions: {
                ecmaFeatures: {
                    impliedStrict: true,
                },
                ecmaVersion: 2020,
            },
            rules: {
                ...require('../rules/index.js').javascript,
                'prettier/prettier': [
                    2,
                    {
                        ...require('../../prettier-config'),
                    },
                ],
            },
        },
    ],
};
