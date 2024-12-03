# Beaver IOT 前端工程规范集合

本项目为 Beaver IoT 大仓项目提供通用的规范配置，让项目可以快速接入并使用，降低接入成本，提升开发效率。

## 下载

```bash
# npm
npm install @milesight/spec -D

# yarn
yarn add @milesight/spec -D

# pnpm
pnpm install @milesight/spec -D
```

## 使用

### Javascript 项目规范配置

```js
// .eslintrc.js
module.exports = {
    root: true,
    extends: [
        require.resolve('@milesight/spec/src/eslint-config/base'),
    ],
};
```

### Typescript 项目规范配置

```js
// .eslintrc.js
module.exports = {
    root: true,
    extends: [
        require.resolve('@milesight/spec/src/eslint-config/base'),
        require.resolve('@milesight/spec/src/eslint-config/typescript'),
    ],
};
```

### React + Typescript 项目规范配置

```js
// .eslintrc.js
module.exports = {
    root: true,
    extends: [
        require.resolve('@milesight/spec/src/eslint-config/base'),
        require.resolve('@milesight/spec/src/eslint-config/react-typescript'),
    ],
};
```

### Stylelint 规范配置

```js
// .stylelintrc.js
module.exports = {
    extends: require.resolve('@milesight/spec/src/stylelint-config'),
};
```

### Prettier 规范配置

```js
// .prettierrc.js
module.exports = require('@milesight/spec/src/prettier-config');
```

### Commitlint 规范配置

```js
// .commitlintrc.js
module.exports = require('@milesight/spec/src/commitlint-config');
```
