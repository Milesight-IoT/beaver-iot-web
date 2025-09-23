/**
 * I18N Service
 *
 * Note: Normally, you should not directly call the methods in this service, but you can
 * use /hooks/useI18n.ts in the business.
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
 * Week start time type
 */
type WeekStartWithType = 'SUNDAY' | 'MONDAY' | 'SATURDAY';

// export type LangType = keyof typeof LANGUAGE;

type LangListType = Partial<
    Record<
        LangType,
        {
            /** Lang key */
            key: LangType;

            /** Lang key of api */
            value: string;

            /** I18n key of lang label */
            labelIntlKey: string;

            /** language resource */
            locale?: Record<string, string> | Record<string, string>[];

            /** MUI lang resource */
            muiLocale: Localization;

            /** moment lang resource */
            // momentLocale?: any;
        }
    >
>;

// Cache key of lang (Note: iotStorage will automatically add the `mos.` prefix)
const CACHE_KEY = 'lang';
// The global event topic of lang change
const LANG_CHANGE_TOPIC = 'iot:lang:change';
export const DEFAULT_LANGUAGE = LANGUAGE.EN;

/**
 * Lang list
 */
export const langs: LangListType = {
    EN: {
        key: LANGUAGE.EN,
        value: i18nHelper.getComponentLanguage(LANGUAGE.EN, 'dayjs'),
        muiLocale: enUS,
        labelIntlKey: 'common.language.en',
    },
    CN: {
        key: LANGUAGE.CN,
        value: i18nHelper.getComponentLanguage(LANGUAGE.CN, 'dayjs'),
        muiLocale: zhCN,
        labelIntlKey: 'common.language.cn',
    },
};

/**
 * Proxy intl related methods to solve the console warning of loading incomplete
 * internationalization messages
 * @returns {Function} lang resource loaded callback
 */
const { loadI18nComplete } = (() => {
    let isLoadFinished = false;

    /**
     * Rewrite `intl.get`, `intl.getHTML`
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
     * Lang resource loaded callback
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
 * I18n init
 */
export const initI18n = async (platform: AppType, defaultLang?: LangType) => {
    let lang = iotStorage.getItem<LangType>(CACHE_KEY) || defaultLang;

    if (!lang || !langs[lang]) {
        let { language } = navigator;

        // Compatible with en, en-US
        // Convert the browser language format into our custom unified format
        language = language.replace('-', '_').toLocaleUpperCase();

        /**
         * Match Chinese characters zh / zh_cn / zh_tw, and unify them into cn
         *
         * Note: There is no 「Traditional Chinese」 in the current system, so the assignment
         * needs to be adjusted if it is supported later
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
 * Change Language
 * @param lang Language
 * @param platform Platform type
 * @params weekStartWith Week start time type
 * @returns {boolean}
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
            console.error('Load I18N resource failed', lang, platform, e);
            return false;
        }

        locale = locales.reduce((acc, item) => ({ ...acc, ...item }), {});
    }

    await intl.init({
        currentLocale: lang,
        // Todo: Should loaded language resources be injected together ?
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
 * Get current language
 */
export const getCurrentLang = (): LangType => {
    const lang = iotStorage.getItem<LangType>(CACHE_KEY);
    return lang || DEFAULT_LANGUAGE;
};

/**
 * Get the Dayjs language corresponding to the current language
 */
export const getCurrentComponentLang = () => {
    const lang = getCurrentLang();
    return i18nHelper.getComponentLanguage(lang, 'dayjs');
};

/**
 * Get week start time and 12 hour format internationalization processing
 *
 * Todo: Check if there is a corresponding configuration in Dayjs
 */
export const getWeekStartAndIntl = (weekStartWith?: WeekStartWithType) => {
    /**
     * Handle week start time
     */
    const dowMap: Record<WeekStartWithType, number> = {
        SUNDAY: 0,
        MONDAY: 1,
        SATURDAY: 6,
    };
    // The default is Sunday
    let dowVal = 0;
    if (weekStartWith && dowMap?.[weekStartWith]) {
        dowVal = dowMap[weekStartWith];
    }

    // Return dayjs configuration
    return {
        week: {
            dow: dowVal,
        },
        /**
         * The i18n of 12 hour format
         */
        meridiem: (hours: number) => {
            return hours < 12 ? intl.get('common.time.morning') : intl.get('common.time.afternoon');
        },
    };
};

export { HTTP_ERROR_CODE_PREFIX };

export const { getHttpErrorKey } = i18nHelper;

/**
 * Language change listener
 * @param callback The callback function
 * @returns {Function} Unsubscribe function
 */
export const onLangChange = (callback: (type: LangType) => void) => {
    eventEmitter.subscribe(LANG_CHANGE_TOPIC, callback);

    return () => removeLangChange(callback);
};

/**
 * Unsubscribe language change function
 */
export const removeLangChange = (callback: (type: LangType) => void) => {
    eventEmitter.unsubscribe(LANG_CHANGE_TOPIC, callback);
};
