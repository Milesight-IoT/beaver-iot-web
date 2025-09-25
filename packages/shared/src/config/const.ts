/**
 * The key parameter in the url that identifies the current tab
 */
export const URL_TAB_SEARCH_KEY = 'tab';

/**
 * Refresh token event topic
 */
export const REFRESH_TOKEN_TOPIC = 'iot:token:refresh';

/**
 * Private property prefix
 */
export const PRIVATE_PROPERTY_PREFIX = '$';

/**
 * Base64 image regex
 */
export const BASE64_IMAGE_REGEX =
    /^data:image\/([\w+-]+);base64,([a-z0-9!$&',()*+;=\-._~:@/?%\s]*?)$/i;

/**
 * Help center address
 */
export const HELP_CENTER_ADDRESS: Partial<Record<LangType, string>> = {
    CN: 'https://www.milesight.com/beaver-iot/zh-Hans/docs/user-guides/introduction/',
    EN: 'https://www.milesight.com/beaver-iot/docs/user-guides/introduction/',
};
