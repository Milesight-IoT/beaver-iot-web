# 通用表单校验规则的规约与使用说明

## 开始使用

封装的 validator 中集成了国际化语言 message，因此在各应用中首次引入时，需先挂载 intl 实例，以使用加载好的 key：

```ts
import intl from 'react-intl-universal';
import { validators } from '@milesight/shared/src/utils';

// ...

validators.validatorIgniter(intl);
```

> auth, client, admin 已引入并初始化，开发同学直接使用即可。

使用：

```tsx
import { Form, Input } from '@yeastar/pc-web-ui';
import { validators } from '@milesight/shared/src/utils';

const { emailCheckers } = validators;

export const LoginForm = () => {
    return <Form name="login">
        <Form.Item
            name="email"
            label="Email"
            rules={emailCheckers()}
        >
            <Input />
        </Form.Item>
    </Form>
}
```

## 基础通用校验 - 断言方法

我们基于 [validator.js](https://github.com/validatorjs/validator.js) 进行封装的一些通用的断言方法 `is[Name]()`：

| Assert | Description |
| --- | --- |
| `isEmpty(value: any, options?: validator.IsEmptyOptions)` | 检查值是否为空 |
| `isContains(value: string, seed: any)` | 验证 value 中是否含有 seed |
| `isEqual(valueA, valueB)` | 验证是否相等 |
| `isCreditCard(value: string)` | 检查是否是信用卡号码 |
| `isDivisibleBy(value: number \| string, number: number)` | 检查 value 是否是一个可以被 number 整除的数字 |
| `isDecimals(value: number \| string, options?: validator.IsDecimalOptions)` | 是否带有小数数值 |
| `isEmail(value: string, options?: validator.IsEmailOptions)` | 检查是否是邮件地址 |
| `isFQDN(value: string, options?: validator.IsFQDNOptions)` | 是否是域名 |
| `isMaxValue(value: number \| string, max: number)` | 是否 value <= max |
| `isMinValue(value: number, min: number)` | 是否 value >= min |
| `isRangeValue(value: number, min: number, max: number)` | 是否 min <= value <= max |
| `isGtValue(value: number, gt: number)` | 是否 value > gt |
| `isLtValue(value: number, lt: number)` | 是否 value < lt |
| `isGLRange(value: number, gt: number, lt: number)` | 是否 gt < value < lt |
| `isHexadecimal(value: string)` | 是否是十六进制数字 |
| `isIP(value: string, version?: validator.IPVersion)` | 是否是 IP 地址值，version 为 4 或者 6 |
| `isIPRange(value: string, version?: validator.IPVersion)` | 是否是 IP 段，version 为 4 或者 6 |
| `isInt(value: string \| number, options?: validator.IsIntOptions)` | 是否是整数 |
| `isJSON(value: string)` | 使用 JSON.parse 判断是否是 json |
| `isMaxLength(value: string, max: number)` | 判断字符串的长度是否不大于最大长度 max |
| `isMinLength(value: string, min: number)` | 判断字符串的长度是否不小于最小长度 min |
| `isRangeLength(value: string, min: number, max: number)` | 判断字符串的长度是否在一个范围内 min <= len <= max |
| `isLowercase(value: string)` | 是否小写 |
| `isMACAddress(value: string, options?: validator.IsMACAddressOptions)` | 是否是 MAC 地址 |
| `isMD5(value: string)` | 是否是 MD5 加密的哈希值 |
| `isMimeType(value: string)` | 是否是 MIME type 值 |
| `isNumeric(value: string, options?: validator.IsNumericOptions)` | 是否仅仅包含数字 |
| `isURL(value: string, options?: validator.IsURLOptions)` | 是否是一个 URL 地址 |
| `isUppercase(value: string)` | 是否大写 |
| `isMatches(value: string, pattern: RegExp)` | 是否匹配，利用 match 方法，其中匹配的模式可以作为第三个参数，当然也可以卸载正则表达式 pattern 中 |
| `isMobilePhone(value: number \| string, locale?: 'any' \| validator.MobilePhoneLocale \| validator.MobilePhoneLocale[], options?: validator.IsMobilePhoneOptions & { loose: boolean; })` | 是否是移动电话号码 |
| `isPostalCode( value: number \| string, locale?: 'any' \| validator.PostalCodeLocale, options?: { loose: boolean })` | 是否有效的邮编号码 |
| `isPort(value: string)` | 是否是端口号 |

### 示例

```tsx
if (isURL('http://localhost:3000')) {
    console.log('正确！');
} else {
    console.log('失败！');
}
```

## 基础通用校验 - Form.Item 的 按条 validator

以下一个方法，对应着一个 valid 的国际化 key。

| Validator | Description | Params |
| --- | --- | --- |
| `checkRequired` | valid.input.required: 'Please configure this item.', | - |
| `checkMinValue` | valid.input.min_value: 'The input value cannot be smaller than {0}.', | min: number 最小值 |
| `checkMaxValue` | valid.input.max_value: 'The input value cannot be greater than {0}.', | max: number 最大值 |
| `checkRangeValue` | valid.input.range_value: '您输入的值应大于等于{0}，且小于等于{1}。', | min: number 最小值 <br /> max: number 最大值 |
| `checkValue` | valid.input.value: '只允许输入值：{0}', | enum: any[] 允许值范围 |
| `checkMinLength` | valid.input.min_length: '您输入的值的长度应不小于{0}。', | min: number 最小长度 |
| `checkMaxLength` | valid.input.max_length: 'The input cannot be greater than {0} characters.', | max: number 最大长度 |
| `checkRangeLength` | valid.input.range_length: '您输入的值的长度应大于等于{0}，且小于等于{1}。', | min: number 最小长度 <br /> max: number 最大长度 |
| `checkLength` | valid.input.length: '只允许输入长度：{0}', | enum: any[] 允许长度值范围 |
| `checkIPAddressV4` | valid.input.ip_address: '请输入正确的 IP 地址，格式为：XXX.XXX.XXX.XXX。', | - |
| `checkIPAddressV6` | valid.input.ipv6_address: '请输入正确的 IP 地址，格式为：X:X:X:X:X:X:X:X。', | - |
| `checkMaskAddress` | valid.input.netmask: '请输入正确的子网掩码，格式为：XXX.XXX.XXX.XXX。', | - |
| `checkMACAddress` | valid.input.mac: '请输入正确的 MAC 地址。', | - |
| `checkMobilePhone` | valid.input.phone: '请输入有效的电话号码，只允许输入数字、字母、空格和字符：().-+\*#。', | - |
| `checkPostalCode` | valid.input.postal_code: '请输入有效邮编', | - |
| `checkNumber` | valid.input.number: '只允许输入数字。', | - |
| `checkNumberNoZero` | valid.input.number_no_zero: '只允许输入大于 0 的数字。', | - |
| `checkHexNumber` | valid.input.hex_number: '只允许十六进制数值。', | - |
| `checkPort` | valid.input.port: '请输入有效的端口号', | - |
| `checkEmail` | valid.input.email: 'Please enter a valid email address.', | - |
| `checkDecimals` | valid.input.decimals: '只允许输入小数', | - |
| `checkLetters` | valid.input.letters: '只允许大小写字母', | - |
| `checkLettersAndNum` | valid.input.letters_and_num: '只允许大小写字母及数字', | - |
| `checkAtLeastOneLowercaseLetter` | valid.input.at_least_1_lowercase_letter: '至少包含一个小写字母' | - |
| `checkAtLeastOneUppercaseLetter` | valid.input.at_least_1_uppercase_letter: '至少包含一个大写字母', | - |
| `checkAtLeastOneNum` | valid.input.at_least_1_num: '至少包含一位数字', | - |
| `checkHasWhitespace` | valid.input.not_include_whitespace: '不允许有空格', | - |
| `checkStartWithNormalChar` | valid.input.start*with_normal_char: '必须以 a-zA-Z0-9* 开头', | - |

> 注意：如果实际使用中需要覆盖默认的 message，所有 validator 方法都支持通过 rule 传入 message 去覆盖默认的 message。

### 示例

基础使用示例：

```tsx
<Form.Item name="email" validateFirst rules={[
    {
        required: true,
        validator: checkRequired,
    }
]}>
```

自定义传入 message

```tsx
<Form.Item
    name="email"
    validateFirst
    rules={[
        {
            required: true,
            validator: checkRequired,
            message: '请填写 Email 地址！',
        },
        {
            validator: checkEmail,
            message: '对不起，您输入的邮箱地址不正确',
        },
    ]}
>
    ...
</Form.Item>
```

通过 rule 向 validator 方法传值

```tsx
<Form.Item
    name="userName"
    validateFirst
    rules={[
        {
            min: 10,
            max: 20,
            validator: checkRangeLength,
        },
    ]}
>
    ...
</Form.Item>
```

## 组合校验规则，Form.Item 的一组 rules

1. **`commentsChecker()`**

    Remark/Comments 备注，正常是在 textarea

    最小 1 位，最大 1024 位

    支持任意字符。

1. **`streetAddressChecker()`**

    Street/Address - 单行地址类

    最小 1 位，最大 255 位

    支持任意字符。

1. **`cityChecker()`**

    City/State/province - 国家城市

    最小 1 位，最大 127 位

    支持任意字符。

1. **`emailCheckers()`**

    生成一组 Email 的校验规则

    格式要求：只允许大小写英文字母、数字 和字符：@符号 下划线* 中划线 - 加号+，英文句号. ，且必须由 大小写字母 或 数字 或 下划线* 开头，.和-后面或者@前面一定要跟上 A-Z，a-z，0-9，\_

    必须符合邮箱格式XXX@XXX.XX

1. **`mobilePhoneChecker()`**

    Mobile Number/Phone Number/Fax- 电话号码类

    最小 1 位，最大 31 位

    允许输入数字，字母，空格和字符：().-+\*#

1. **`postalCodeChecker()`**

    Zip/Postal Code- 邮政编码类

    最小 1 位，最大 31 位

    允许输入数字，字母，空格和字符：().-+\*#

1. **`normalNameChecker()`**

    Name - 名称类，非用户名

    最小 1 位，最大 127 位

    支持输入任意字符，不支持输入纯空格。（提交后用 Trim（）去掉最前和最后的空格）

1. **`firstNameChecker()`**

    First Name

    最小 1 位，最大 63 位

    任意字符

1. **`lastNameChecker()`**

    Last Name

    最小 1 位，最大 63 位

    任意字符

1. **`companyNameChecker()`**

    Company Name

    与 normalNameChecker 规则一样

1. **`companyIdChecker()`**

    Company ID （智慧办公产品的标识 ID）

1. **`SNChecker()`**

    SN（Yeastar 所有产品通用规范）

1. **`moneyChecker()`**

    金额输入

    小数点前最大 10 位，小数点后 2 位

### 示例：

基础使用：

```tsx
<Form.Item rules={[commentsChecker()]}>...</Form.Item>
```

跟别的自定义规则组合：

```tsx
<Form.Item
    rules={[
        {
            required: true,
            validator: checkRequired,
        },
        ...moneyChecker(),
    ]}
>
    ...
</Form.Item>
```

## 其他属性和方法

| 属性/方法 | 描述 |
| --- | --- |
| `EErrorMessages` | 枚举值，它用于存放通用的校验与国际化 key 的对应关系。 |
| `getErrorMessage = (localeKey: EErrorMessages \| string, values?: Record<string, any>): ReactElement \| 'error'` | 取得 国际化处理后的 错误信息 <br /><br /> 参数 `localeKey` 国际化文案的 key <br /> 参数 `values` 向 `FormattedMessage` 组件传值，提供变量给国际化文案模板使用 <br /><br /> 返回值：ReactElement \| 'error' 找不到任何的 localeKey 就会返回 'error' 字符串 |

基础示例：

```tsx
<Form.Item rules={[
    {
        required: true,
        message: getErrorMessage(EErrorMessages.required)
    }
]}>
```

传参示例：

```tsx
<Form.Item rules={[
    {
        min: 10,
        max: 20,
        validator: checkRangeLength,
        message: getErrorMessage(ErrorMessages.rangeLength, {
            0: 10,
            1: 20
        })
    }
]}>
```
