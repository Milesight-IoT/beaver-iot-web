/**
 * 天气数据类型
 */
export interface WeatherProps {
    /**
     * 云量
     */
    cloud: string;
    /**
     * 露点温度
     */
    dew: string;
    /**
     * 时间
     */
    fx_time: string;
    /**
     * 湿度
     */
    humidity: string;
    /**
     * 天气图标代码
     */
    icon: string;
    /**
     * 过去1小时降水量
     */
    precip: string;
    /**
     * 压强
     */
    pressure: string;
    /**
     * 气温
     */
    temp: string;
    /**
     * 天气描述
     */
    text: string;
    /**
     * 风向
     */
    wind360: string;
    /**
     * 风力
     */
    wind_dir: string;
    /**
     * 风速等级
     */
    wind_scale: string;
    /**
     * 风速
     */
    wind_speed: string;
}
