const types = [
    'feat',
    'fix',
    'docs',
    'style',
    'test',
    'ci',
    'refactor',
    'chore',
    'revert',
    'perf',
    'wip',
    'build',
];

exports.types = types;

module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'body-leading-blank': [1, 'always'],
        'body-max-line-length': [2, 'always', 120],
        'footer-leading-blank': [1, 'always'],
        'footer-max-line-length': [2, 'always', 120],
        'header-max-length': [2, 'always', 120],
        'subject-case': [0],
        'subject-empty': [2, 'never'],
        'subject-full-stop': [2, 'never', '.'],
        'scope-case': [0],
        'type-case': [2, 'always', 'lower-case'],
        'type-enum': [2, 'always', types],
    },
};
