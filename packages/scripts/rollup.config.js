const json = require('@rollup/plugin-json');
const { babel } = require('@rollup/plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const typescript = require('@rollup/plugin-typescript');
const peerDepsExternal = require('rollup-plugin-peer-deps-external');
const { dependencies } = require('./package.json');

module.exports = {
    input: 'src/index.ts',
    output: [
        {
            dir: 'dist',
            format: 'cjs',
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
        commonjs({
            include: /node_modules/,
            requireReturnsDefault: 'auto',
        }),
        typescript(),
        json(),
    ],
    // External dependencies are not packaged
    external: Object.keys(dependencies),
};
