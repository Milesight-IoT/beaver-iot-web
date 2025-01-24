// prettier-ignore
module.exports = {
    'lines-between-class-members': [
        // Requires or disallows blank lines between class members
        2,
        'always',
        {
            exceptAfterSingleLine: true, // Skip checking empty lines after single-line class members
        },
    ],
    'prefer-destructuring': [
        2,
        {
            array: false,
            object: true,
        },
    ],
    'no-unused-vars': [1, { argsIgnorePattern: '^_' }],
    'no-useless-constructor': 1,
    'global-require': 0,
    'max-classes-per-file': 0,
    'class-methods-use-this': 0,
    'no-void': 0,
    'no-plusplus': 0,
    'no-nested-ternary': 0, // Nested ternary expressions are prohibited
    'no-restricted-globals': 0, // Disable a specific global variable
    'no-use-before-define': 0, // Do not use before definition
    'no-underscore-dangle': 0, // Disallow dangling underscores in identifiers
    'no-unused-expressions': 0, // Disallow unused expressions
    'no-empty': 1,
    'no-empty-function': [1, { allow: ['arrowFunctions'] }],
    'no-shadow': 0, // Forbid local variables to have the same name as global variables
    'no-continue': 0, // The continue statement in the loop
    'no-param-reassign': 0, // Disallow variable reassignment
    'consistent-return': 0, // Function, a consistent return value
    'radix': [1, 'as-needed'],
    'import/prefer-default-export': 0, // When there is only a single export from a module, prefer using default export over named export.
    'import/extensions': 0, // Ensure consistent use of file extension within the import path
    'import/no-extraneous-dependencies': 0, // Forbid the use of extraneous packages
    'import/no-named-as-default-member': 0,
    'no-restricted-syntax': 0,
    'no-labels': 0,
    'default-param-last': 0,
};
