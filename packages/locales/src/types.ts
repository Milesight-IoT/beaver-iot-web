export type AppType = 'web';

/**
 * 需国际化处理的第三方库
 */
export type LanguageComponentType = 'moment' | 'antd' | 'mui' | 'dayjs';

/**
 * 系统支持的国际化语言枚举
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
