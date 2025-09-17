import { LANGUAGE } from './types';
import type { LanguageComponentType, AppType } from './types';

interface OptInterface {
    defaultLanguage: keyof typeof LANGUAGE;
}

const languages = Object.values(LANGUAGE);
/** Each application depends on the language pack module configuration */
const appLocalModules: Record<AppType, string[]> = {
    web: ['global', 'dashboard', 'device', 'error', 'setting', 'workflow', 'entity', 'user', 'tag'],
};

/**
 * Mapping relationship between system language and external dependent language package
 */
const componentMapLanguage: Record<LanguageComponentType, Record<LANGUAGE, string>> = {
    moment: {
        [LANGUAGE.EN]: 'en',
        [LANGUAGE.CN]: 'zh-cn',
        [LANGUAGE.IT]: 'it',
        [LANGUAGE.DE]: 'de',
        [LANGUAGE.PT]: 'pt',
        [LANGUAGE.FR]: 'fr',

        [LANGUAGE.NL]: 'nl',
        [LANGUAGE.TH]: 'th',

        [LANGUAGE.ES]: 'es',

        [LANGUAGE.TR]: 'tr',
        [LANGUAGE.HE]: 'he',
        [LANGUAGE.AR]: 'en',
        [LANGUAGE.RU]: 'ru',
        [LANGUAGE.PT_BR]: 'pt-br',
    },
    dayjs: {
        [LANGUAGE.EN]: 'en',
        [LANGUAGE.CN]: 'zh-cn',
        [LANGUAGE.IT]: 'it',
        [LANGUAGE.DE]: 'de',
        [LANGUAGE.PT]: 'pt',
        [LANGUAGE.FR]: 'fr',

        [LANGUAGE.NL]: 'nl',
        [LANGUAGE.TH]: 'th',

        [LANGUAGE.ES]: 'es',

        [LANGUAGE.TR]: 'tr',
        [LANGUAGE.HE]: 'he',
        [LANGUAGE.AR]: 'ar',
        [LANGUAGE.RU]: 'ru',
        [LANGUAGE.PT_BR]: 'pt-br',
    },
    antd: {
        [LANGUAGE.EN]: 'en_US',
        [LANGUAGE.CN]: 'zh_CN',
        [LANGUAGE.IT]: 'it_IT',
        [LANGUAGE.DE]: 'de_DE',
        [LANGUAGE.PT]: 'pt_PT',
        [LANGUAGE.FR]: 'fr_FR',
        [LANGUAGE.NL]: 'nl_NL',
        [LANGUAGE.TH]: 'th_TH',
        [LANGUAGE.ES]: 'es_ES',
        [LANGUAGE.TR]: 'tr_TR',
        [LANGUAGE.HE]: 'he_IL',
        [LANGUAGE.AR]: 'ar_EG',
        [LANGUAGE.RU]: 'ru_RU',
        [LANGUAGE.PT_BR]: 'pt_BR',
    },
    mui: {
        [LANGUAGE.EN]: 'enUS',
        [LANGUAGE.CN]: 'zhCN',
        [LANGUAGE.IT]: 'itIT',
        [LANGUAGE.DE]: 'deDE',
        [LANGUAGE.PT]: 'ptPT',
        [LANGUAGE.FR]: 'frFR',
        [LANGUAGE.NL]: 'nlNL',
        [LANGUAGE.TH]: 'thTH',
        [LANGUAGE.ES]: 'esES',
        [LANGUAGE.TR]: 'trTR',
        [LANGUAGE.HE]: 'heIL',
        [LANGUAGE.AR]: 'arEG',
        [LANGUAGE.RU]: 'ruRU',
        [LANGUAGE.PT_BR]: 'ptBR',
    },
};

/** Prefix of the interface error code copy key */
export const HTTP_ERROR_CODE_PREFIX = 'error.http.';

export class LocaleHelper {
    opt: OptInterface;
    constructor(opt: OptInterface) {
        this.opt = opt;
    }

    init(opt?: OptInterface) {
        if (opt && JSON.stringify(opt) !== '{}') {
            this.opt = Object.assign(this.opt, opt);
        }
    }

    /**
     * Gets the third-party library language pack mapping string and returns EN if there is no match
     */
    getComponentLanguage(lang: OptInterface['defaultLanguage'], type: LanguageComponentType) {
        const localMapping = componentMapLanguage[type];

        if (languages.includes(lang as LANGUAGE)) {
            return localMapping[lang];
        }

        return localMapping[LANGUAGE.EN];
    }

    getLanguages(): LANGUAGE[] {
        return languages;
    }

    /**
     * Loads the language pack for the specified module
     * @param {String} moduleName The module name must be the same as the corresponding language package name
     * @param {String} lang Language character
     */
    private async loadLocaleByModule(
        moduleName: string,
        lang?: Lowercase<OptInterface['defaultLanguage']> | OptInterface['defaultLanguage'],
    ): Promise<Record<string, string>> {
        const currentLang = lang ? lang.toLocaleLowerCase() : this.opt.defaultLanguage;
        let res;

        try {
            res = await import(`./lang/${currentLang}/${moduleName}.json`);
        } catch (e) {
            res = await import(`./lang/en/${moduleName}.json`);
        }

        return res.default;
    }

    /**
     * Load the language package and get the language package json file resource
     * @param {String} appName Get an end's language pack resource
     * @param {String} lang Language character
     */
    getLoadedLocales(
        appName: AppType,
        lang?: Lowercase<OptInterface['defaultLanguage']> | OptInterface['defaultLanguage'],
    ) {
        return Promise.all(
            appLocalModules[appName].map(moduleName => this.loadLocaleByModule(moduleName, lang)),
        );
    }

    /**
     * Gets the Interface error code copy Key
     * @param errCode Interface error code
     */
    getHttpErrorKey(errCode?: string) {
        if (!errCode) return '';
        return `${HTTP_ERROR_CODE_PREFIX}${errCode}`;
    }
}
