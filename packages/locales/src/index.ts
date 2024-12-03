import { LocaleHelper, HTTP_ERROR_CODE_PREFIX } from './helper';
import { LANGUAGE } from './types';

export * from './types';
export { HTTP_ERROR_CODE_PREFIX };
export default new LocaleHelper({ defaultLanguage: LANGUAGE.EN });
