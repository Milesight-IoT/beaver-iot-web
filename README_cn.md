# Beaver IoT Web

Beaver IoT Web 是基于 Monorepo 的前端项目，包含了 Web 应用及其依赖的构建脚本、项目规范、国际化、公共代码等子库，利用 Pnpm Workspace 进行管理，提供了统一的开发环境和构建流程，方便开发和维护。

## 目录结构

```
beaver-iot-web
├── apps            # 应用目录
│   └── web         # Web 应用
│
├── packages        # 依赖库目录
│   ├── locales     # 国际化库
│   ├── scripts     # 公共脚本库
│   ├── shared      # 公共代码库
│   └── spec        # 项目规范库
│
├── README.md
├── package.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

## 开发维护

### 基础环境配置

本项目推荐使用 Pnpm 对环境和依赖进行管理。以下介绍简单示例：

> 为保证开发调试环境的一致性，我们约定基础环境版本需满足 `pnpm>=8.0.0`, `node>=20.0.0`，低于此版本的将不做额外的兼容支持。若已安装了 Pnpm & Node，可跳过此步骤。

1. 安装 Pnpm

    ```bash
    curl -fsSL https://get.pnpm.io/install.sh | sh -
    ```

    参考 [Pnpm 安装文档](https://pnpm.io/installation)。

2. 安装 Node

    ```bash
    # 安装 Node.js 的 LTS 版本
    pnpm env use --global lts
    ```

    参考 [Pnpm Node.js 环境管理文档](https://pnpm.io/cli/env)。

3. 克隆仓库到本地

    生成 SSH Key（如果本地已有，可跳过）：

    ```bash
    # 一路「回车」即可
    ssh-keygen -t rsa -C "your_email@domain.com"

    # 拷贝公钥
    # Git Bash on Windows
    cat ~/.ssh/id_rsa.pub | clip

    # Mac
    cat ~/.ssh/id_rsa.pub | pbcopy
    ```

    将生成并拷贝的 SSH 公钥，复制粘贴到 Gitlab 的 `用户设置 -> SSH 密钥` 中。然后，即可免密克隆项目到本地：

    ```bash
    # 克隆仓库
    git clone git@github.com:Milesight-IoT/beaver-iot-web.git

    # 进入项目目录
    cd beaver-iot-web

    # 配置提交的用户名及邮箱
    # 若需全局修改，可增加 --global 参数
    git config user.name xxx
    git config user.email xxx@domain.com
    ```

### 启动本地开发服务

```bash
# 下载依赖
pnpm i

# 启动本地开发服务
# packages 中以 `@milesight` 命名的依赖包也会同时启动开发服务
pnpm run start
```

### 国际化开发

项目中集成了国际化支持，开发者可根据需要自行开启。

所有文案均在 `packages/locales` 库维护，当要添加新的文案时，建议在 `packages/locales/src/lang/en` 相应模块中添加，开发完成后可使用 `pnpm run i18n:export` 命令将本次添加的所有文案导出为 json 文案，以便相关人员进行多语言翻译处理。

翻译好的文案，可放入 `packages/locales/import` 目录下，然后执行 `pnpm run i18n:import` 命令将文案导入到 `packages/locales/src/lang` 中，即可在应用中使用。

### 构建编译

只需执行命令：

```bash
pnpm run build
```

以上命令将构建 Monorepo 中所有子应用和依赖库，构建产物将输出到各子库 `dist` 目录下。

### 常用命令

| 命令                       | 说明                                                 |
| -------------------------- | ---------------------------------------------------- |
| `pnpm run start`           | 启动开发服务                                         |
| `pnpm run build`           | 开始构建编译                                         |
| `pnpm run i18n:import`     | 国际化文案导入                                       |
| `pnpm run i18n:export`     | 国际化文案导出，会同步执行文案校验（只校验新增文案） |

## 相关链接

- [Pnpm](https://pnpm.io/)
- [Node](https://nodejs.org/)
