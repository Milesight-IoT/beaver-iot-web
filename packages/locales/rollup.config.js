const json = require('@rollup/plugin-json');
const { babel } = require('@rollup/plugin-babel');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const typescript = require('@rollup/plugin-typescript');
const peerDepsExternal = require('rollup-plugin-peer-deps-external');
const dynamicImportVars = require('@rollup/plugin-dynamic-import-vars');

module.exports = {
    input: 'src/index.ts',
    output: [
        {
            dir: 'dist',
            format: 'es',
            preserveModules: true,
            // preserveModulesRoot: 'src',
            sourcemap: true,
        },
    ],
    plugins: [
        peerDepsExternal(),
        babel({
            babelHelpers: 'bundled',
            exclude: 'node_modules/**', // Compile source code only
        }),
        nodeResolve(),
        typescript(),
        json(),
        dynamicImportVars(),
    ],
};
