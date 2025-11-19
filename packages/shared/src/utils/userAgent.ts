const UA = window.navigator.userAgent;

/**
 * @description Check if the client is the mobile terminal
 */
// export function isMobile() {
//     // eslint-disable-next-line
//     return /Android|iPhone|webOS|BlackBerry|SymbianOS|Windows Phone|iPad|iPod/i.test(UA);
// }
export const isMobile = (): boolean => {
    if (typeof window === 'undefined') return false;

    const isPhoneScreen = window.matchMedia('(max-width: 767px)').matches;

    // Mobile feature detection (excluding iPad)
    const mobileDeviceRegex = /(iPhone|iPod|Android.*Mobile|Windows Phone)/i;
    const isMobileUA = mobileDeviceRegex.test(UA) && !/iPad/i.test(UA);

    // Tablet feature detection (for secondary exclusion)
    const tabletRegex = /(iPad|Android|Tablet)/i;
    const isTablet = tabletRegex.test(UA) && !/Mobile/i.test(UA);

    return (isMobileUA || isPhoneScreen) && !isTablet;
};

/**
 * @description Check if the client is the tablet terminal
 */
export const isTablet = (): boolean => {
    if (typeof window === 'undefined') return false;

    const isTabletScreen = window.matchMedia('(min-width: 768px) and (max-width: 1024px)').matches;

    // Tablet feature detection
    const tabletRegex = /(iPad|Android|Tablet)/i;
    const isTabletUA = tabletRegex.test(UA) && !/Mobile/i.test(UA);

    // Exclude desktop Chrome browser simulation for iPad
    const isDesktopChrome = /Chrome/i.test(UA) && !/Mobile/i.test(UA);

    return (isTabletUA || isTabletScreen) && !isDesktopChrome;
};

/**
 * @description Check whether the client is iOS
 */
export function isIOS() {
    return !!UA.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
}

/**
 * @description Check if the device is an Apple device (iOS, iPadOS, macOS)
 * Detects iPhone, iPad, iPod, and Mac devices
 */
export function isAppleDevice(): boolean {
    if (typeof window === 'undefined') return false;

    const { userAgent: ua, platform } = window.navigator;

    // Check for iOS devices (iPhone, iPod)
    const isIOSDevice = /iPhone|iPod/.test(ua);

    // Check for iPad
    // iPadOS 13+ reports as Mac in UA, so we need additional checks
    const isIPad = /iPad/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // Check for macOS
    const isMac = /Macintosh|Mac OS X/.test(ua) && !isIPad;

    return isIOSDevice || isIPad || isMac;
}

/**
 * @description Check if the client is Safari browser
 */
export function isSafari() {
    return /^((?!chrome|android).)*safari/i.test(UA);
}

/**
 * @description Check whether the client is Android
 */
export function isAndroid() {
    return UA.indexOf('Android') > -1 || UA.indexOf('Adr') > -1;
}

/**
 * @description Check whether it is the WeChat WebView environment
 */
export function isWeiXin() {
    return /MicroMessenger/i.test(UA);
}

/**
 * @description Check whether it is a webkit kernel browser
 */
export function isWebkitBrowser(): boolean {
    return /webkit/i.test(UA);
}

/**
 * Determine whether it is Windows system
 */
export function isWindows() {
    return /windows|win32|win64/i.test(UA);
}

/**
 * Determine whether it is IE browser
 */
export function isIE() {
    return UA.indexOf('MSIE') !== -1 || UA.indexOf('Trident/') !== -1;
}

/**
 * Determine whether it is Edge browser
 */
export function isEdge() {
    return UA.indexOf('Edge') !== -1;
}

/**
 * Determine whether it is IE or Edge browser
 */
export function isIEorEdge() {
    return isIE() || isEdge();
}
