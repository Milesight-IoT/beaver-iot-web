import React, { useEffect, useState, useRef } from 'react';
import { useRequest } from 'ahooks';

import { entityAPI, getResponseData, isRequestSuccess, awaitWrap } from '@/services/http';
import { WeatherWidget } from './components';

import type { WeatherProps } from './interface';

import styles from './style.module.less';

export interface ViewProps {
    config: {
        entity?: EntityOptionType;
        title?: string;
    };
}

const View = (props: ViewProps) => {
    const { config } = props;
    const { entity, title } = config || {};

    const [weatherData, setWeatherData] = useState<WeatherProps[]>();
    const intervalGetWeatherRef = useRef<ReturnType<typeof setInterval>>();

    const { run: getWeather } = useRequest(
        async () => {
            const key = entity?.rawData?.entityKey;
            if (key) {
                const [error, resp] = await awaitWrap(
                    entityAPI.callService({
                        exchange: {
                            [key]: null,
                        },
                    }),
                );

                if (error || !isRequestSuccess(resp)) {
                    return;
                }

                const data = getResponseData(resp) as
                    | {
                          weather24h?: WeatherProps[];
                      }
                    | undefined;
                const { weather24h } = data || {};
                setWeatherData(weather24h);
            }
        },
        {
            manual: true,
        },
    );

    useEffect(() => {
        getWeather();
    }, [entity, getWeather]);

    /**
     * 定时拉取最新天气数据
     */
    useEffect(() => {
        let myGetWeatherInterval = intervalGetWeatherRef?.current;
        if (!myGetWeatherInterval) {
            myGetWeatherInterval = setInterval(
                () => {
                    getWeather();
                },
                60 * 60 * 1000,
                // 1小时刷新一次
            );
        }

        intervalGetWeatherRef.current = myGetWeatherInterval;

        return () => {
            if (myGetWeatherInterval) {
                clearInterval(myGetWeatherInterval);
                intervalGetWeatherRef.current = undefined;
            }
        };
    }, [getWeather]);

    return (
        <div className={styles['weather-container']}>
            <WeatherWidget title={title} weatherData={weatherData} getWeather={getWeather} />
        </div>
    );
};

export default React.memo(View);
