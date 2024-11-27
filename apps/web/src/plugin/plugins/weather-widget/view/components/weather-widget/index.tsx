import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames';

import { useTime } from '@milesight/shared/src/hooks';
import { SvgIcon } from '@/components';
import ClearDayJpg from '../../assets/clear_day.jpg';
import ClearNightJpg from '../../assets/clear_night.jpg';
import { getIconCodeByMap } from '../../utils';

import type { WeatherProps } from '../../interface';

import styles from './style.module.less';

export interface WeatherWidgetProps {
    title?: string;
    weatherData?: WeatherProps[];
    getWeather: () => void;
}

/**
 * 天气组件
 */
const WeatherWidget: React.FC<WeatherWidgetProps> = props => {
    const { title, weatherData, getWeather } = props || {};

    const { getTimeFormat } = useTime();

    const [translateX, setTranslateX] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const hoursRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    /**
     * 今天天气
     */
    const todayWeather = useMemo(() => {
        return weatherData?.[0];
    }, [weatherData]);

    /**
     * 今天时间的分钟数
     */
    const currentMinutes = useCallback(() => {
        const now = dayjs();
        const hours = now.hour();
        return hours * 60 + now.minute();
    }, []);

    useEffect(() => {
        const divNode = containerRef?.current;
        // 创建一个 ResizeObserver 实例
        const resizeObserver = new ResizeObserver(() => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                /**
                 * 天气宽度发生变化
                 * 重置偏移量
                 */
                setTranslateX(0);
            }, 300);
        });

        // 开始观察元素
        if (divNode) {
            resizeObserver.observe(divNode);
        }

        return () => {
            if (divNode) {
                resizeObserver.unobserve(divNode);
            }
        };
    }, []);

    /**
     * 往前查看天气
     */
    const handleForward = useCallback(() => {
        const hoursNode = hoursRef.current?.getBoundingClientRect();
        const width = Number(hoursNode?.width);

        const addX = -translateX + 175;
        const maxX = 24 * 58 - width;
        const currentX = addX > maxX ? maxX : addX;
        setTranslateX(-currentX);
    }, [translateX]);

    /**
     * 往后查看添加
     */
    const handleBack = useCallback(() => {
        const addX = -translateX - 175;
        const currentX = addX < 0 ? 0 : addX;
        setTranslateX(-currentX);
    }, [translateX]);

    const renderHours = () => {
        return (weatherData || []).map(w => {
            return (
                <div key={w.fx_time} className={styles.hour}>
                    <div className={styles.time}>{w.fx_time}</div>
                    <div className={styles.icon}>
                        <SvgIcon name={getIconCodeByMap(w.icon)} width="36" height="36" />
                    </div>
                    <div className={styles.temperature}>{w.temp}°C</div>
                </div>
            );
        });
    };

    const forwardCls = useMemo(() => {
        const hoursNode = hoursRef.current?.getBoundingClientRect();
        const width = Number(hoursNode?.width);
        const maxX = 24 * 58 - width;

        return classNames(styles.forward, {
            [styles.banned]: Math.abs(translateX) >= maxX,
        });
    }, [translateX]);

    const backCls = useMemo(() => {
        return classNames(styles.back, {
            [styles.banned]: Math.abs(translateX) <= 0,
        });
    }, [translateX]);

    const renderWeatherHours = () => {
        if (!Array.isArray(weatherData)) {
            return null;
        }

        return (
            <>
                <div className={styles.divider} />
                <div className={styles['weather-hours-container']}>
                    <div ref={hoursRef} className={styles['hours-wrapper']}>
                        <div
                            className={styles['inner-hours']}
                            style={{ transform: `translate(${translateX}px, 0)` }}
                        >
                            {renderHours()}
                        </div>
                    </div>
                    <div className={forwardCls} onClick={handleForward}>
                        <SvgIcon name="arrow-right" width="14" height="14" />
                    </div>
                    <div className={backCls} onClick={handleBack}>
                        <SvgIcon name="arrow-left" width="14" height="14" />
                    </div>
                </div>
            </>
        );
    };

    const renderRefresh = () => {
        if (!Array.isArray(weatherData)) {
            return null;
        }

        return (
            <div className={styles.refresh} onClick={getWeather}>
                <SvgIcon name="refresh" width="24" height="24" />
            </div>
        );
    };

    return (
        <div
            ref={containerRef}
            className={styles['weather-widget-container']}
            style={{
                backgroundImage: `url(${currentMinutes() >= 18 * 60 ? ClearNightJpg : ClearDayJpg})`,
            }}
        >
            <div className={styles.date}>{getTimeFormat(Date.now(), 'simpleDateFormat')}</div>
            <div className={styles.name}>{title}</div>
            <div className={styles['weather-info']}>
                <div className={styles.num}>{todayWeather?.temp || '-'}°C</div>
                <div className={styles.icon}>
                    <SvgIcon
                        name={getIconCodeByMap(todayWeather?.icon || '100')}
                        width="56"
                        height="56"
                    />
                </div>
                <div className={styles.description}>{todayWeather?.text}</div>
            </div>
            <div className={styles.additional}>
                <div className={styles['additional-container']}>
                    <div className={styles.item}>
                        <SvgIcon name="wind" width="16" height="16" />
                        <span className={styles.text}>{todayWeather?.wind_speed || '-'} m/s</span>
                    </div>
                    <div className={styles.item}>
                        <SvgIcon name="drop" width="16" height="16" />
                        <span className={styles.text}>{todayWeather?.humidity || '-'}%</span>
                    </div>
                    <div className={styles.item}>
                        <SvgIcon name="wind_dir" width="16" height="16" />
                        <span className={styles.text}>{todayWeather?.wind_dir || '-'}</span>
                    </div>
                </div>
            </div>
            {renderWeatherHours()}
            {renderRefresh()}
        </div>
    );
};

export default WeatherWidget;
