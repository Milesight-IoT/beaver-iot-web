/**
 * 国际化多语言服务
 *
 * 注意：通常情况下请勿直接调用该服务中的相关方法，业务中可通过 /hooks/useI18n.ts 来使用
 */
/* eslint-disable camelcase */
import intl from 'react-intl-universal';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash-es';
import { zhCN, enUS, type Localization } from '@mui/material/locale';
import i18nHelper, { LANGUAGE, HTTP_ERROR_CODE_PREFIX } from '@milesight/locales';
import iotStorage from '../utils/storage';
import eventEmitter from '../utils/event-emitter';

// https://github.com/iamkun/dayjs/tree/dev/src/locale
import 'dayjs/locale/zh-cn';

// import type { WeekStartWithType } from '../utils/time/interface';
/**
 * 周开始时间类型
 */
type WeekStartWithType = 'SUNDAY' | 'MONDAY' | 'SATURDAY';

export type LangType = keyof typeof LANGUAGE;

type LangListType = Partial<
    Record<
        LangType,
        {
            /** 语言 key */
            key: LangType;

            /** 接口数据映射值 */
            value: string;

            /** 语言说明 */
            label?: string;

            /** 文案包 */
            locale?: Record<string, string> | Record<string, string>[];

            /** MUI 对应语言包资源 */
            muiLocale?: Localization;

            /** moment 对应语言包资源（非 false 表示已加载） */
            // momentLocale?: any;
        }
    >
>;

// 缓存 key（注意：使用 iotStorage 会自动拼接 msiot. 前缀）
const CACHE_KEY = 'lang';
// 语言变更监听事件名
const LANG_CHANGE_TOPIC = 'iot:lang:change';
export const DEFAULT_LANGUAGE = LANGUAGE.EN;

/**
 * 语言列表
 */
export const langs: LangListType = {
    EN: {
        key: LANGUAGE.EN,
        value: i18nHelper.getComponentLanguage(LANGUAGE.EN, 'dayjs'),
        muiLocale: enUS,
    },
    CN: {
        key: LANGUAGE.CN,
        value: i18nHelper.getComponentLanguage(LANGUAGE.CN, 'dayjs'),
        muiLocale: zhCN,
    },
};

/**
 * 代理intl相关方法，解决国际化文案加载未完成时出现的控制台警告
 * @returns {Function} - loadI18nComplete 国际化文案加载完成
 */
const { loadI18nComplete } = (() => {
    let isLoadFinished = false;

    /**
     * 重写intl相关方法
     */
    const patchIntl = () => {
        const originalIntlGet = intl.get;
        const originalIntlGetHTML = intl.getHTML;

        // @ts-ignore
        intl.get = (...params) => {
            const { locales, currentLocale } = intl.getInitOptions() || {};
            const locale = locales && currentLocale && locales[currentLocale];

            if (!isLoadFinished && !locale) return '';

            return originalIntlGet.apply(intl, params);
        };

        // @ts-ignore
        intl.getHTML = (...params) => {
            const { locales, currentLocale } = intl.getInitOptions() || {};
            const locale = locales && currentLocale && locales[currentLocale];

            if (!isLoadFinished && !locale) return '';

            return originalIntlGetHTML.apply(intl, params);
        };
    };
    /**
     * 语言包加载完成
     */
    const loadI18nComplete = () => {
        isLoadFinished = true;
    };

    patchIntl();

    return {
        loadI18nComplete,
    };
})();

/**
 * 国际化初始化
 */
export const initI18n = async (platform: AppType, defaultLang?: LangType) => {
    let lang = iotStorage.getItem<LangType>(CACHE_KEY) || defaultLang;

    if (!lang || !langs[lang]) {
        let { language } = navigator;

        // 兼容 en en-US
        // 将浏览器语言格式转换成 我们自定义的统一的格式
        language = language.replace('-', '_').toLocaleUpperCase();

        /**
         * 匹配中文 zh / zh_cn / zh_tw 等字符，统一处理为 cn
         * 注意：当前系统中无「繁体中文」，若后续要支持，则下方赋值需做调整
         */
        if (/^zh(_\w+)?/i.test(language)) {
            language = LANGUAGE.CN;
        }

        lang = langs[language as LangType] ? (language as LangType) : DEFAULT_LANGUAGE;
    }

    await changeLang(lang, platform);
    loadI18nComplete();
};

/**
 * 切换语言
 * @param lang 语言
 * @param platform 平台
 * @params weekStartWith 周开始时间
 * @returns true 成功，false 失败
 */
export const changeLang = async (
    lang: LangType,
    platform: AppType = 'web',
    weekStartWith?: WeekStartWithType,
): Promise<boolean> => {
    const dayjsLang = i18nHelper.getComponentLanguage(lang, 'dayjs');
    let locale = langs[lang]?.locale;
    if (!locale || isEmpty(locale)) {
        let locales: Record<string, string>[] = [];

        try {
            locales = await i18nHelper.getLoadedLocales(platform, lang);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('国际化文案加载失败', lang, platform, e);
            return false;
        }

        locale = locales.reduce((acc, item) => ({ ...acc, ...item }), {});
    }

    await intl.init({
        currentLocale: lang,
        // Todo: 已加载的其他语言文案是否要一起注入？
        locales: { [lang]: locale },
        escapeHtml: false,
    });

    dayjs.locale(dayjsLang);

    if (langs[lang]) langs[lang]!.locale = locale;

    eventEmitter.publish(LANG_CHANGE_TOPIC, lang);
    iotStorage.setItem(CACHE_KEY, lang);

    const html = document.querySelector('html');
    html?.setAttribute('lang', getCurrentComponentLang());

    return true;
};

/**
 * 获取当前语言
 */
export const getCurrentLang = (): LangType => {
    const lang = iotStorage.getItem<LangType>(CACHE_KEY);
    return lang || DEFAULT_LANGUAGE;
};

/**
 * 获取当前语言映射的 Dayjs 语言
 */
export const getCurrentComponentLang = () => {
    const lang = getCurrentLang();
    return i18nHelper.getComponentLanguage(lang, 'dayjs');
};

/**
 * 返回周开始时间、12 小时制国际化处理
 *
 * TODO: 验证 Dayjs 中是否有对应的配置
 */
export const getWeekStartAndIntl = (weekStartWith?: WeekStartWithType) => {
    /**
     * 周开始时间处理
     */
    const dowMap: Record<WeekStartWithType, number> = {
        SUNDAY: 0,
        MONDAY: 1,
        SATURDAY: 6,
    };
    // 默认周开始时间为周日
    let dowVal = 0;
    if (weekStartWith && dowMap?.[weekStartWith]) {
        dowVal = dowMap[weekStartWith];
    }

    // 返回 dayjs 配置
    return {
        week: {
            dow: dowVal,
        },
        /**
         * 12 小时制国际化处理
         */
        meridiem: (hours: number) => {
            return hours < 12 ? intl.get('common.time.morning') : intl.get('common.time.afternoon');
        },
    };
};

export { HTTP_ERROR_CODE_PREFIX };

export const { getHttpErrorKey } = i18nHelper;

/**
 * 监听系统语言变更
 * @param callback 主题变更时的回调函数
 * @returns 返回移除监听函数
 */
export const onLangChange = (callback: (type: LangType) => void) => {
    eventEmitter.subscribe(LANG_CHANGE_TOPIC, callback);

    return () => removeLangChange(callback);
};

/**
 * 移除系统语言变更监听
 */
export const removeLangChange = (callback: (type: LangType) => void) => {
    eventEmitter.unsubscribe(LANG_CHANGE_TOPIC, callback);
};
