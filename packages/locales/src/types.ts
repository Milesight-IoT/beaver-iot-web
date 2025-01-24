export type AppType = 'web';

/**
 * Third-party libraries that require internationalization
 */
export type LanguageComponentType = 'moment' | 'antd' | 'mui' | 'dayjs';

/**
 * Enumeration of internationalized languages supported by the system
 */
export enum LANGUAGE {
    EN = 'EN',
    CN = 'CN',
    IT = 'IT',
    DE = 'DE',
    PT = 'PT',
    FR = 'FR',

    NL = 'NL',
    TH = 'TH',

    ES = 'ES',

    TR = 'TR',

    HE = 'HE',
    RU = 'RU',
    AR = 'AR',
    PT_BR = 'PT_BR',
}
