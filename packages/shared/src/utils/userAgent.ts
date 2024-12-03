const UA = window.navigator.userAgent;

/**
 * @description 检查客户端是否为移动端
 */
export function isMobile() {
    // eslint-disable-next-line
    return /Android|iPhone|webOS|BlackBerry|SymbianOS|Windows Phone|iPad|iPod/i.test(UA);
}

/**
 * @description 检查客户端是否为 IOS
 */
export function isIOS() {
    return !!UA.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
}

/**
 * @description 检查客户端是否为 safari 浏览器
 */
export function isSafari() {
    return /^((?!chrome|android).)*safari/i.test(UA);
}

/**
 * @description 检查客户端是否为 android
 */
export function isAndroid() {
    return UA.indexOf('Android') > -1 || UA.indexOf('Adr') > -1;
}

/**
 * @description 检查是否为微信 webview 环境
 */
export function isWeiXin() {
    return /MicroMessenger/i.test(UA);
}

/**
 * @description 检查是否为 webkit 内核浏览器
 */
export function isWebkitBrowser(): boolean {
    return /webkit/i.test(UA);
}

/**
 * 判断是否为 Windows 系统
 */
export function isWindows() {
    return /windows|win32|win64/i.test(UA);
}
