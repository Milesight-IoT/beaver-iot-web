import { useState, useEffect, useCallback } from 'react';
import { toast } from '@milesight/shared/src/components';
// import { RenderView } from '../../../render';
import { Tooltip } from '@/components';
import { ViewConfigProps, WeatherDataState, WeatherResponse } from './typings';
import './style.less';

interface Props {
    config: ViewConfigProps;
    configJson: CustomComponentProps;
}

const getWeatherEmoji = (weather: string): string => {
    const weatherMap: { [key: string]: string } = {
        晴: '☀️',
        多云: '⛅️',
        阴: '☁️',
        小雨: '🌧️',
        中雨: '🌧️',
        大雨: '⛈️',
        暴雨: '⛈️',
        雷阵雨: '⛈️',
        小雪: '🌨️',
        中雪: '🌨️',
        大雪: '🌨️',
        暴雪: '🌨️',
        雾: '🌫️',
        霾: '🌫️',
        沙尘暴: '🌪️',
        雨夹雪: '🌨️',
        阵雨: '🌦️',
        阵雪: '🌨️',
        晴转多云: '🌤️',
        扬沙: '💨',
    };

    // 如果找不到对应的emoji，返回默认值
    return weatherMap[weather] || '❓';
};

const View = (props: Props) => {
    const { config, configJson } = props;
    const [weatherData, setWeatherData] = useState<Partial<WeatherDataState>>({});
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState(false);

    const fetchWeatherData = useCallback(async () => {
        try {
            setLoading(true);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

            const response = await fetch(
                `http://xz.wepuzi.com/weather.php?city=${encodeURIComponent(config.city || '北京')}`,
                { signal: controller.signal },
            );
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: WeatherResponse = await response.json();

            if (result.status === 200) {
                const { data, time, yiyan } = result;
                setWeatherData({
                    temp: data.wendu,
                    weather: data.forecast[0].type,
                    humidity: data.shidu,
                    sunrise: data.forecast[0].sunrise,
                    sunset: data.forecast[0].sunset,
                    air_level: data.quality,
                    update_time: time,
                    high: data.forecast[0].high?.replace('高温 ', ''),
                    low: data.forecast[0].low?.replace('低温 ', ''),
                    yiyan,
                });
            } else {
                throw new Error(`${result.status}` || '获取天气数据失败');
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('获取天气数据失败:', error);
            let errorMessage = '获取天气数据失败，请稍后重试';
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    errorMessage = '请求超时，请检查网络连接';
                } else if (error.message.includes('HTTP error')) {
                    errorMessage = '服务器响应异常，请稍后重试';
                }
            }
            toast.error({
                key: 'weather-error',
                content: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    }, [config.city]);

    useEffect(() => {
        fetchWeatherData();

        const interval = setInterval(fetchWeatherData, 10000);

        return () => {
            clearInterval(interval);
        };
    }, [fetchWeatherData]);

    const renderWeatherContent = (isPreview = false) => {
        let _weatherData = weatherData;
        if (isPreview) {
            _weatherData = {
                temp: '25',
                weather: '晴',
                humidity: '65%',
                sunrise: '06:26',
                sunset: '16:53',
                air_level: '优',
                update_time: '2024-01-01 12:00:00',
                high: `20℃`,
                low: `5℃`,
                yiyan: '又是开心的一天！',
            };
        }
        if (!_weatherData) return null;

        return (
            <Tooltip arrow placement="top" title={_weatherData.yiyan || ''}>
                <div>
                    <div className="weather-view-title">{config.city} 天气预报</div>
                    <div className="weather-view-temperature">
                        {_weatherData.low} - {_weatherData.high}{' '}
                        {getWeatherEmoji(_weatherData?.weather || '')}
                    </div>
                    <div className="weather-view-details">
                        日出: {_weatherData.sunrise} | 日落: {_weatherData.sunset}
                    </div>
                    <div className="weather-view-details">
                        湿度: {_weatherData.humidity} | 空气质量: {_weatherData?.air_level}
                    </div>
                    <div className="weather-view-update-time">
                        更新时间: {_weatherData.update_time}
                    </div>
                </div>
            </Tooltip>
        );
    };

    if (configJson.isPreview) {
        return (
            <div className="weather-view-wrapper preview">
                {/* {loading ? (
                    <div className="weather-view-loading">加载中...</div>
                ) : ( */}
                {renderWeatherContent(configJson.isPreview)}
                {/* )} */}
            </div>
        );
    }

    return (
        <div className="weather-view-wrapper">
            {/* {loading ? (
                <div className="weather-view-loading">加载中...</div>
            ) : ( */}
            {renderWeatherContent()}
            {/* )} */}
        </div>
    );
};

export default View;
