# 国际化文案库

Beaver IoT 国际化文案库内置了多语言处理能力，对外暴露了相关处理方法，可满足 Monorepo 大仓所有项目的国际化处理需求，API 简洁，使用简单。

## 命名规范

为避免多语言文案的命名冲突，我们约定了一套统一的命名规范：

1. 文案 key 命名必须为**小写、下划线（`_`）** 拼接的字符，格式为 `{一级}.{二级}.{...}.{具体功能}`，命名层级最多不应超过 4 级，如：`auth.free_trial.tip`；
2. 文案中若有变量，则必须使用整型的数字占位，比如：`"common.label.edit_title": "Edit {1}"`；
3. 若为全局文案，约定以 `common` 作为 key 的一级命名；
4. 若为后端错误码文案，约定命名规则为 `error.http.{error_code}`，其中 `error_code` 为后端返回的错误码，如：`error.http.data_no_found`；

## 开发维护

本仓库会维护大仓所有项目的多语言文案，为避免各应用在运行时载入冗余资源，我们约定以文案 key 的一级命名作为模块拆分依据，开发时可基于此规则进行文件模块拆分，具体可参考 `src/lang/en` 目录下的文件模块拆分。

在拆分模块的同时，我们也允许将多类一级 key 合并为一个模块，如当前配置中将 `common`, `valid`, `auth` 合并如 `global.json` 中，作为一个模块。具体可参考 `scripts/local.config.json` 配置文件。

常用命令：
```bash
# 从 `import` 目录导入并拆分国际化文案
pnpm run import

# 导出文案到 `.export` 目录，并检验
pnpm run export
```
