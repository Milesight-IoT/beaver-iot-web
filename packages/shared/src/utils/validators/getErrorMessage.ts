import intl from 'react-intl-universal';

/**
 * General check rule and i18n key mapping
 */
export enum EErrorMessages {
    /**
     * Required
     */
    required = 'valid.input.required',
    /**
     * Minimum value
     */
    minValue = 'valid.input.min_value',
    /**
     * Maximum value
     */
    maxValue = 'valid.input.max_value',
    /**
     * Range value
     */
    rangeValue = 'valid.input.range_value',
    /**
     * Value
     */
    value = 'valid.input.value',
    /**
     * Minimum length
     */
    minLength = 'valid.input.min_length',
    /**
     * Maximum length
     */
    maxLength = 'valid.input.max_length',
    /**
     * Range length
     */
    rangeLength = 'valid.input.range_length',
    /**
     * Length
     */
    length = 'valid.input.length',
    /**
     * IP address
     */
    ipAddress = 'valid.input.ip_address',
    /**
     * IPv6 address
     */
    ipv6Address = 'valid.input.ipv6_address',
    /**
     * IPv4 address
     */
    netmask = 'valid.input.netmask',
    /**
     * MAC address
     */
    mac = 'valid.input.mac',
    /**
     * Mobile Number/Phone Number/Fax
     */
    phone = 'valid.input.phone',
    /**
     * +86 手机号码
     * +86 phone number (Chinese phone number)
     */
    cnPhone = 'valid.input.cn_phone',
    /**
     * Zip/Postal Code
     */
    postalCode = 'valid.input.postal_code',
    /**
     * Numeric value
     */
    number = 'valid.input.number',
    /**
     * Decimal value, no 0
     */
    numberNoZero = 'valid.input.number_no_zero',
    /**
     * Hexadecimal value
     */
    hexNumber = 'valid.input.hex_number',
    /**
     * Port: network port
     */
    port = 'valid.input.port',
    /**
     * Email Address
     */
    email = 'valid.input.email',
    /**
     * Username
     */
    username = 'valid.input.username',
    /**
     * Password
     */
    password = 'valid.input.password',
    /**
     * Decimal value
     */
    decimals = 'valid.input.decimals',
    /**
     * Letters
     */
    letters = 'valid.input.letters',
    /**
     * Letters and numbers
     */
    lettersAndNum = 'valid.input.letters_and_num',
    /**
     * Remark/Comments
     */
    comments = 'valid.input.comments',
    /**
     * At least 1 lowercase letter
     */
    atLeastOneLowercaseLetter = 'valid.input.at_least_1_lowercase_letter',
    /**
     * At least one uppercase letter
     */
    atLeastOneUppercaseLetter = 'valid.input.at_least_1_uppercase_letter',
    /**
     * At least one number
     */
    atLeastOneNum = 'valid.input.at_least_1_num',
    /**
     * Cannot contain spaces
     */
    notIncludeWhitespace = 'valid.input.not_include_whitespace',
    /**
     * Must start with a number, letter or underscore
     */
    startWithNormalChar = 'valid.input.start_with_normal_char',
    /**
     * Maximum number of digits
     */
    amountMaxLength = 'valid.input.amount_max_length',
    /**
     * Amount can only have {0} decimal places
     */
    amountDecimalsMaxLength = 'valid.input.amount_decimals_max_length',
    /**
     * Company ID
     */
    companyId = 'valid.input.company_id',
    /**
     * Number, letter, space and character: ().-+*#
     */
    numLetterSpaceSimpleSpecial = 'valid.input.num_letter_space_simple_special',
    /**
     * SN (12/16)
     */
    sn = 'valid.input.sn',
    /**
     * Url Address
     */
    url = 'valid.input.url',
    /**
     * ASCII characters without spaces
     */
    noIncludesSpaceAscii = 'valid.input.no_includes_space_ascii',
    /**
     * Strings can only contain uppercase letters, lowercase letters, numbers, and "_" and "-"
     */
    stringRulesOne = 'valid.input.string_rules_one',
    /**
     * Strings can only contain uppercase letters, lowercase letters, numbers,
     * and "!"#$%&'()*+,-./:;<=>@[]^_`{|}~"
     */
    stringRulesTwo = 'valid.input.string_rules_two',
    /**
     * 检测是否为 ipv4/ipv6 或域名
     * IPv4/IPv6 or domain
     */
    ipOrDomain = 'valid.input.ip_or_domain',
    /**
     * Integer validation (positive integer, negative integer, and zero)
     */
    integerPositiveNegativeZero = 'valid.input.integer_positive_negative_zero',
    /**
     * Positive integer validation (positive integer and zero)
     */
    integerPositiveZero = 'valid.input.integer_positive_zero',
    /**
     * Positive integer validation (positive integer)
     */
    integerPositive = 'valid.input.integer_positive',
    /**
     * Must start with http/https
     */
    startWithHttpOrHttps = 'valid.input.start_with_http_https',
    /**
     * Must start with ws/wss
     */
    startWithWsOrWss = 'valid.input.start_with_ws_wss',
    /**
     * Not allow string: &\/\:*?'"<>|%
     */
    notAllowStringOne = 'valid.input.not_allow_string',
    /**
     * Match regular expression
     */
    regexp = 'valid.input.match_regexp',
    /**
     * Must start with specify characters
     */
    startWithSpecialChar = 'valid.input.start_with_special_char',
}

// let intlInstance: typeof intl;
// export const intlInstanceGenerator = (instance: typeof intl) => {
//     intlInstance = instance;
// };

/**
 * Get the internationalized error message
 * @param {String} key i18n key
 * @param {Object} options Variables in message
 * @returns {String}
 */
const getErrorMessage = (key: EErrorMessages | string, options?: Record<string, any>): string => {
    // if (!intlInstance) {
    //     throw Error('Please init intlInstance first.');
    // }
    return intl.get(key, options).d('error');
};

export default getErrorMessage;
