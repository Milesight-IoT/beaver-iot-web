import intl from 'react-intl-universal';

/**
 * 存放通用的校验与国际化 key 的对应关系
 */
export enum EErrorMessages {
    /**
     * 必填项
     */
    required = 'valid.input.required',
    /**
     * 最小值
     */
    minValue = 'valid.input.min_value',
    /**
     * 最大值
     */
    maxValue = 'valid.input.max_value',
    /**
     * 最大最小值
     */
    rangeValue = 'valid.input.range_value',
    /**
     * 有效值
     */
    value = 'valid.input.value',
    /**
     * 最小位数
     */
    minLength = 'valid.input.min_length',
    /**
     * 最大位数
     */
    maxLength = 'valid.input.max_length',
    /**
     * 最大最小位数
     */
    rangeLength = 'valid.input.range_length',
    /**
     * 固定位数
     */
    length = 'valid.input.length',
    /**
     * IPv4类 IP地址/掩码/网关
     */
    ipAddress = 'valid.input.ip_address',
    /**
     * IPv6类 IP地址
     */
    ipv6Address = 'valid.input.ipv6_address',
    /**
     * IPv4类 IP地址/掩码/网关
     */
    netmask = 'valid.input.netmask',
    /**
     * Mac地址
     */
    mac = 'valid.input.mac',
    /**
     * Mobile Number/Phone Number/Fax- 电话号码类
     */
    phone = 'valid.input.phone',
    /**
     * +86 手机号码
     */
    cnPhone = 'valid.input.cn_phone',
    /**
     * Zip/Postal Code- 邮政编码类
     */
    postalCode = 'valid.input.postal_code',
    /**
     * 数值
     */
    number = 'valid.input.number',
    /**
     * 十进制数值，无0
     */
    numberNoZero = 'valid.input.number_no_zero',
    /**
     * 十六进制数值
     */
    hexNumber = 'valid.input.hex_number',
    /**
     * 端口：网络端口
     */
    port = 'valid.input.port',
    /**
     * Email Address - 邮箱地址
     */
    email = 'valid.input.email',
    /**
     * username校验
     */
    username = 'valid.input.username',
    /**
     * 密码校验
     */
    password = 'valid.input.password',
    /**
     * 是否小数
     */
    decimals = 'valid.input.decimals',
    /**
     * 支持大小写字母
     */
    letters = 'valid.input.letters',
    /**
     * 支持数字和大小写字母
     */
    lettersAndNum = 'valid.input.letters_and_num',
    /**
     * Remark/Comments备注，正常是在 textarea
     */
    comments = 'valid.input.comments', // 备注通用
    /**
     * 至少包含一个小写字母
     */
    atLeastOneLowercaseLetter = 'valid.input.at_least_1_lowercase_letter',
    /**
     * 至少包含一个大写字母
     */
    atLeastOneUppercaseLetter = 'valid.input.at_least_1_uppercase_letter',
    /**
     * 至少包含一个数字
     */
    atLeastOneNum = 'valid.input.at_least_1_num',
    /**
     * 不能包含空格
     */
    notIncludeWhitespace = 'valid.input.not_include_whitespace',
    /**
     * 必须以大小写字母或数字或下划线开头
     */
    startWithNormalChar = 'valid.input.start_with_normal_char',
    /**
     * 金额最多只能 {0} 位
     */
    amountMaxLength = 'valid.input.amount_max_length',
    /**
     * 金额最多只能 {0} 位小数
     */
    amountDecimalsMaxLength = 'valid.input.amount_decimals_max_length',
    /**
     * 请输入一个11位有效企业ID。
     */
    companyId = 'valid.input.company_id',
    /**
     * 允许输入数字，字母，空格和字符：().-+*#
     */
    numLetterSpaceSimpleSpecial = 'valid.input.num_letter_space_simple_special',
    /**
     * 请输入一个有效的12位或者16位的数字和大小写字母组合的序列号。
     */
    sn = 'valid.input.sn',
    /**
     * Url Address - URL地址
     */
    url = 'valid.input.url',
    /**
     * 不含空格的ASCII字符
     */
    noIncludesSpaceAscii = 'valid.input.no_includes_space_ascii',
    /**
     * 仅允许输入大写字母、小写字母、数字及“_”、“-”
     */
    stringRulesOne = 'valid.input.string_rules_one',
    /**
     * 仅允许输入大写字母、小写字母、数字及!"#$%&'()*+,-./:;<=>@[]^_`{|}~
     */
    stringRulesTwo = 'valid.input.string_rules_two',
    /**
     * 检测是否为 ipv4/ipv6 或域名
     */
    ipOrDomain = 'valid.input.ip_or_domain',
    /**
     * 整数校验（正整数、负整数和零）
     */
    integerPositiveNegativeZero = 'valid.input.integer_positive_negative_zero',
    /**
     * 正整数校验（正整数和零）
     */
    integerPositiveZero = 'valid.input.integer_positive_zero',
    /**
     * 必须以 http/https 开头
     */
    startWithHttpOrHttps = 'valid.input.start_with_http_https',
    /**
     * 必须以 ws/wss 开头
     */
    startWithWsOrWss = 'valid.input.start_with_ws_wss',
    /**
     * 不允许字符: &/\:*?'"<>|%
     */
    notAllowStringOne = 'valid.input.not_allow_string',
}

// let intlInstance: typeof intl;
// export const intlInstanceGenerator = (instance: typeof intl) => {
//     intlInstance = instance;
// };

/**
 * 取得 国际化处理后的 错误信息
 * @param {String} key 国际化文案的 key
 * @param {Object} options 向 FormattedMessage 组件传值，提供变量给国际化文案模板使用
 * @returns {String} 找不到任何的 key 就会返回 'error' 字符串
 */
const getErrorMessage = (key: EErrorMessages | string, options?: Record<string, any>): string => {
    // if (!intlInstance) {
    //     throw Error('Please init intlInstance first.');
    // }
    return intl.get(key, options).d('error');
};

export default getErrorMessage;
