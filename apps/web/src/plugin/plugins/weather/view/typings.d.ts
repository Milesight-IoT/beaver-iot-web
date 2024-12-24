export interface ViewConfigProps {
    showTitle: boolean;
    title: string;
    entity: Record<string, any>;
    showIcon: boolean;
    icon: string;
    city: string;
    interval: string;
}

// 天气预报单日数据接口
export interface ForecastDay {
    date: string;
    high: string;
    low: string;
    ymd: string;
    week: string;
    sunrise: string;
    sunset: string;
    aqi: number;
    fx: string;
    fl: string;
    type: string;
    notice: string;
}

// 城市信息接口
export interface CityInfo {
    city: string;
    citykey: string;
    parent: string;
    updateTime: string;
}

// 天气数据接口
export interface WeatherData {
    shidu: string;
    pm25: number;
    pm10: number;
    quality: string;
    wendu: string;
    ganmao: string;
    forecast: ForecastDay[];
    yesterday: ForecastDay;
}

// 完整的天气响应接口
export interface WeatherResponse {
    status: number;
    date: string;
    time: string;
    cityInfo: CityInfo;
    data: WeatherData;
    yiyan: string;
}

export interface WeatherDataState {
    temp: string; // 当前温度
    weather: string; // 天气状况
    humidity: string; // 湿度
    sunrise: string; // 日出时间
    sunset: string; // 日落时间
    air_level: string; // 空气质量等级
    update_time: string; // 更新时间
    high: string; // 最高温度
    low: string; // 最低温度
    yiyan: string;
}
