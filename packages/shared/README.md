# @milesight/shared

在 Monorepo 大仓中，我们通常会有多个应用及多个依赖子库，应用间、子库间会存在代码复用，我们希望这部分可复用的代码在大仓中的引用无需构建编译，以充分利用 Tree Shaking，同时减少构建时间，提高开发效率。故我们将这部分代码抽离出来，作为一个独立的 `shared` 子库，在大仓各子库中引用时，按需引入 `shared` 库中相应模块。

## 目录结构

```
.
├── src
│   ├── components      # 公共组件
│   ├── config          # 通用配置
│   ├── hooks           # 通用 Hook
│   ├── services        # 公共服务
│   ├── store           # 全局数据 Store
│   ├── styles          # 全局样式
│   └── utils           # 公共工具
│
├── types               # 全局类型定义
├── README.md
├── package.json
└── tsconfig.json
```
