module.exports = {
    plugins: ['check-file'],
    rules: {
        'check-file/no-index': 0,
        'check-file/filename-blocklist': [
            2,
            {
                '**/*.model.ts': '*.models.ts',
                '**/*.util.ts': '*.utils.ts',
            },
        ],
        'check-file/folder-match-with-fex': [
            2,
            {
                '*.test.{js,jsx,ts,tsx}': '**/__tests__/',
            },
        ],
        // Disable file name verification temporarily because there are many file name verification scenarios
        'check-file/filename-naming-convention': [
            0,
            {
                '**/*.{jsx,tsx}': 'PASCAL_CASE',
                '**/*.{js,ts}': 'KEBAB_CASE',
            },
        ],
        'check-file/folder-naming-convention': [
            2,
            {
                'src/**/': '+([a-z0-9])*([a-z0-9])*(-+([a-z0-9]))|use*([A-Z]*([a-z0-9]))',
                'public/*/': 'KEBAB_CASE',
            },
        ],
    },
};
