/**
 * Internationalization related hooks
 */
import React, { Fragment, ReactElement, useCallback, useMemo } from 'react';
import intl from 'react-intl-universal';
import {
    langs,
    changeLang,
    DEFAULT_LANGUAGE,
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
/** External language mapping value */
export const apiLangs: Partial<Record<LangType, string>> = {
    CN: 'zh',
    EN: 'en',
};

// export type { LangType };

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

            // A method to generate a list of components
            const generateComponentList = (cb: genComponentPropsCb) => {
                // Convert the variable in options into a temporary token for getting copy
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

                // Replace the temporary token with a variable in options
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

            // Component key controller
            const ComponentKeyController = (() => {
                const keyList: string[] = [];
                const set = (key: string) => keyList.push(key);
                const get = () => keyList.shift();

                return { set, get };
            })();
            // Generate component list
            const ComponentList = generateComponentList(({ type, id }) => {
                if (type === 'component') {
                    ComponentKeyController.set(id!);
                }
            });
            // Generates the key of the component
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

    const mergeIntlText = useCallback(
        (keys: string[]) => {
            const texts = keys.map(key => getIntlText(key));
            const separator = lang === 'CN' ? '' : ' ';

            return texts.join(separator);
        },
        [lang, getIntlText],
    );

    return {
        /** Current language */
        lang,

        /** External data mapping values for the current language */
        apiLang: apiLangs[lang!] || (lang || '').toLocaleLowerCase(),

        /** External data map value for the currently existing optional language */
        apiLangs,

        /** Language list */
        langs,

        /** Component library internationalization copy */
        muiLocale: langs[lang || DEFAULT_LANGUAGE]!.muiLocale,

        /** Mapping table between interface error codes and copy keys */
        httpErrorKeys,

        /** Change language */
        changeLang,

        /** Get i18n text according to key */
        getIntlText,

        /** Get the i18n text with the ReactNode based on the key */
        getIntlNode,

        /** Get the i18n text with HTML based on the key */
        getIntlHtml,

        /** Merge multiple i18n keys */
        mergeIntlText,

        /** Obtain the interface error code i18n Key */
        getHttpErrorKey,

        /** Gets the moment of the current language */
        getCurrentComponentLang,
    };
};
