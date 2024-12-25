module.exports = {
    root: true,
    extends: [
        'expo',
        require.resolve('@milesight/spec/src/eslint-config/base'),
        require.resolve('@milesight/spec/src/eslint-config/react-typescript'),
    ],
    ignorePatterns: ['/dist/*'],
};
