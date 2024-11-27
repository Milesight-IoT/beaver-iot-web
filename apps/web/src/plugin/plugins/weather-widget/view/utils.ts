/**
 * 所有的天气 icon
 */
const allWeatherIcons = [
    '100',
    '101',
    '104',
    '150',
    '151',
    '300',
    '302',
    '304',
    '305',
    '306',
    '307',
    '310',
    '313',
    '400',
    '401',
    '402',
    '403',
    '404',
    '500',
    '502',
    '503',
    '504',
    '507',
    '508',
    '509',
    '511',
    '512',
    '900',
    '901',
];

/**
 * 多云
 */
const cloudy = ['101', '102', '103'];

/**
 * 夜间多云
 */
const nightCloudy = ['151', '152', '153'];

/**
 * 阵雨
 */
const showerRain = ['300', '301', '350', '351'];

/**
 * 雷阵雨
 */
const thunderShowerRain = ['302', '303'];

/**
 * 小雨
 */
const smallRain = ['305', '309', '314', '399'];

/**
 * 中雨
 */
const middleRain = ['306', '315'];

/**
 * 大雨
 */
const BigRain = ['307', '316'];

/**
 * 暴雨
 */
const heavyRain = ['308', '310', '311', '312', '317', '318'];

/**
 * 小雪
 */
const smallSnow = ['400', '408', '499', '407', '457'];

/**
 * 中雪
 */
const middleSnow = ['401', '409'];

/**
 * 大雪
 */
const bigSnow = ['402', '410'];

/**
 * 雨夹雪
 */
const rainWithSnow = ['404', '405', '406', '456'];

/**
 * 雾
 */
const fog = ['500', '501'];

/**
 * 浓雾
 */
const heavyFog = ['509', '510', '514', '515'];

/**
 * 重度霾
 */
const heavyDust = ['512', '513'];

/**
 * 根据图标代码映射相应图标
 */
export const getIconCodeByMap = (code: string) => {
    if (cloudy.includes(code)) {
        return '101';
    }

    if (nightCloudy.includes(code)) {
        return '151';
    }

    if (showerRain.includes(code)) {
        return '300';
    }

    if (thunderShowerRain.includes(code)) {
        return '302';
    }

    if (smallRain.includes(code)) {
        return '305';
    }

    if (middleRain.includes(code)) {
        return '306';
    }

    if (BigRain.includes(code)) {
        return '307';
    }

    if (heavyRain.includes(code)) {
        return '310';
    }

    if (smallSnow.includes(code)) {
        return '400';
    }

    if (middleSnow.includes(code)) {
        return '401';
    }

    if (bigSnow.includes(code)) {
        return '402';
    }

    if (rainWithSnow.includes(code)) {
        return '404';
    }

    if (fog.includes(code)) {
        return '500';
    }

    if (heavyFog.includes(code)) {
        return '509';
    }

    if (heavyDust.includes(code)) {
        return '512';
    }

    // 若不在以上列表中，返回 100，表示未匹配到天气类型
    return allWeatherIcons.includes(code) ? code : '100';
};
