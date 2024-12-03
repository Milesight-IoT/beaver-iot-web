/**
 * 国际化相关 Hook
 */
import React, { Fragment, ReactElement, useCallback, useMemo } from 'react';
import intl from 'react-intl-universal';
import {
    langs,
    changeLang,
    DEFAULT_LANGUAGE,
    LangType,
    getHttpErrorKey,
    getCurrentComponentLang,
    HTTP_ERROR_CODE_PREFIX,
} from '../services/i18n';
import { useSharedGlobalStore } from '../stores';
import { genRandomString } from '../utils/tools';

interface genComponentProps {
    type: 'text' | 'component';
    content: React.ReactNode;
    id?: string;
}
type genComponentPropsCb = (value: genComponentProps) => void;
/** 外部语言映射值 */
export const apiLangs: Partial<Record<LangType, string>> = {
    CN: 'zh',
    EN: 'en',
};

export default () => {
    const lang = useSharedGlobalStore(state => state.lang);
    const httpErrorKeys = useMemo(() => {
        const result: Record<string, string> = {};

        if (!lang) return result;
        const locales = langs[lang]?.locale || {};

        Object.keys(locales).forEach(key => {
            if (key.startsWith(HTTP_ERROR_CODE_PREFIX)) {
                result[key.replace(HTTP_ERROR_CODE_PREFIX, '')] = key;
            }
        });

        return result;
    }, [lang]);

    const getIntlText = useCallback(
        (key: string, options?: Record<number | string, any>) => {
            return intl.get(key, options).d(key);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [lang],
    );

    const getIntlHtml = useCallback(
        (key: string, options?: Record<number | string, any>) => {
            return intl.getHTML(key, options);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [lang],
    );

    const getIntlNode = useCallback(
        (key: string, options?: Record<number | string, any>, onlyText?: boolean) => {
            if (!options) return intl.get(key).d(key);

            // 用于生成组件列表的方法
            const generateComponentList = (cb: genComponentPropsCb) => {
                // 将options中的变量转成临时token，用于获取文案
                const { variables, strategy, tokenMap } = Object.keys(options || {}).reduce(
                    ({ variables, strategy, tokenMap }, key) => {
                        const token = genRandomString();

                        return {
                            variables: {
                                ...variables,
                                [key]: token,
                            },
                            strategy: {
                                ...strategy,
                                [token]: options[key],
                            },
                            tokenMap: {
                                ...tokenMap,
                                [token]: key,
                            },
                        };
                    },
                    { variables: {}, strategy: {}, tokenMap: {} } as {
                        variables: Record<string, string>;
                        strategy: Record<string, React.ReactNode>;
                        tokenMap: Record<string, string>;
                    },
                );
                const message = intl.get(key, variables);
                const regex = new RegExp(Object.values(variables).join('|'), 'g');

                // 将临时token替换成options中的变量
                const result: React.ReactNode[] = [];
                let str = message;
                message.replace(regex, (match, index, msg) => {
                    const startIndex = msg.length - str.length;
                    const start = msg.slice(startIndex, index);
                    const content = strategy[match];
                    result.push(start, content);
                    str = msg.slice(index + match.length);

                    cb({ type: 'text', content: start });
                    cb({ type: 'component', content, id: tokenMap[match] });

                    return match;
                });
                result.push(str);

                return result;
            };

            // 组件 key 控制器
            const ComponentKeyController = (() => {
                const keyList: string[] = [];
                const set = (key: string) => keyList.push(key);
                const get = () => keyList.shift();

                return { set, get };
            })();
            // 生成组件列表
            const ComponentList = generateComponentList(({ type, id }) => {
                if (type === 'component') {
                    ComponentKeyController.set(id!);
                }
            });
            // 生成组件的key
            const generateComponentKey = (item: ReactElement) => {
                if (typeof item === 'string') return genRandomString();

                return item?.key || ComponentKeyController.get() || void 0;
            };
            return (
                <>
                    {ComponentList.filter(Boolean).map(Component => {
                        const key = generateComponentKey(Component as ReactElement);

                        return typeof Component === 'string' && !onlyText ? (
                            // eslint-disable-next-line react/no-danger
                            <span key={key} dangerouslySetInnerHTML={{ __html: Component }} />
                        ) : (
                            <Fragment key={key}>{Component}</Fragment>
                        );
                    })}
                </>
            );
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [lang],
    );

    return {
        /** 当前语言 */
        lang,

        /** 当前语言的外部数据映射值 */
        apiLang: apiLangs[lang!] || (lang || '').toLocaleLowerCase(),

        /** 当前存在的可选语言的外部数据映射值 */
        apiLangs,

        /** 语言列表 */
        langs,

        /** 组件库国际化文案 */
        muiLocale: langs[lang || DEFAULT_LANGUAGE]?.muiLocale,

        /** 接口错误码与文案 key 映射表 */
        httpErrorKeys,

        /** 变更语言 */
        changeLang,

        /** 根据 key 获取文案 */
        getIntlText,

        /** 根据 key 获取带 ReactNode 的文案 */
        getIntlNode,

        /** 根据 key 获取带 HTML 的文案 */
        getIntlHtml,

        /** 获取接口错误码文案 Key */
        getHttpErrorKey,

        /** 获取当前语言的 moment */
        getCurrentComponentLang,
    };
};
