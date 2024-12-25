import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import { Map, View, Feature } from 'ol';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { Style, Icon } from 'ol/style';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import { click } from 'ol/events/condition';
import Select from 'ol/interaction/Select';
import { Modal } from '@milesight/shared/src/components';
import { Descriptions } from '@/components';
import { entityAPI, awaitWrap, isRequestSuccess, getResponseData } from '@/services/http';
import styles from './style.module.less';

interface Device {
    label: string;
    value: string;
    address: {
        label: string;
        lon: number;
        lat: number;
    };
    entity: any;
}
interface Desc {
    key: string;
    label: string;
    content: string;
}
interface IProps {
    chooseData: {
        config: {
            [key: string]: any;
        };
    };
}

const MapComponent: React.FC<IProps> = ({ chooseData }) => {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<Map | null>(null);
    const vectorSourceRef = useRef<VectorSource>(new VectorSource());
    const selectClickRef = useRef<Select | null>(null);
    const [deviceArr, setDeviceArr] = useState<Device[]>([]);
    const [descList, setDescList] = useState<Desc[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [clickValue, setClickValue] = useState<Device | null>(null);
    const [isNightMode, setIsNightMode] = useState(false);
    const [legendVisible, setLegendVisible] = useState(false);
    const [legendContent, setLegendContent] = useState<string>('');
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    useEffect(() => {
        if (mapRef.current) {
            const vectorLayer = new VectorLayer({
                source: vectorSourceRef.current,
            });

            const dayLayer = new TileLayer({
                source: new XYZ({
                    url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    attributions:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                }),
            });

            const nightLayer = new TileLayer({
                source: new XYZ({
                    url: 'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                    attributions: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
                }),
            });

            const map = new Map({
                target: mapRef.current,
                layers: [isNightMode ? nightLayer : dayLayer, vectorLayer],
                view: new View({
                    center: [0, 0],
                    zoom: 2,
                }),
            });

            const selectClick = new Select({
                condition: click,
            });

            map.addInteraction(selectClick);
            selectClickRef.current = selectClick;

            selectClick.on('select', e => {
                const selectedFeature = e.selected[0];
                if (selectedFeature) {
                    const deviceId = selectedFeature.getId() as string;
                    const foundDevice = deviceArr.find(device => device.value === deviceId);
                    setClickValue(foundDevice || null);
                    setModalOpen(true);
                }
            });

            // // 添加 pointerdrag 事件监听器
            // map.on('pointerdrag', event => {
            //     event.stopPropagation();
            // });

            mapInstanceRef.current = map;

            return () => {
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.setTarget(undefined);
                    mapInstanceRef.current = null;
                }
            };
        }
    }, [deviceArr, isNightMode]);

    useEffect(() => {
        if (chooseData.config && chooseData.config.device) {
            const updatedDevices: Device[] = chooseData.config.device.map(
                (item: { label: any; value: string }) => ({
                    label: item.label,
                    value: item.value,
                    address: chooseData.config[`addr_${item.value}`],
                    entity: chooseData.config[`deviceEntity_${item.value}`],
                }),
            );
            setDeviceArr(updatedDevices);
        }
    }, [chooseData.config]);

    useEffect(() => {
        if (deviceArr.length > 0 && mapInstanceRef.current) {
            vectorSourceRef.current.clear();

            deviceArr.forEach(device => {
                if (!device.address) {
                    return;
                }
                const coordinates = fromLonLat([device.address.lon, device.address.lat]);
                const pointFeature = new Feature({
                    geometry: new Point(coordinates),
                });

                const iconStyle = new Style({
                    image: new Icon({
                        anchor: [0.5, 1],
                        src: '/point.png',
                        scale: 0.1,
                    }),
                });

                pointFeature.setStyle(iconStyle);
                pointFeature.setId(device.value);
                vectorSourceRef.current.addFeature(pointFeature);
            });

            const devices = deviceArr.filter(device => device.address);
            if (devices.length === 1) {
                const firstDevice = deviceArr[0];
                const firstDeviceCoordinates = fromLonLat([
                    firstDevice.address.lon,
                    firstDevice.address.lat,
                ]);
                mapInstanceRef.current.getView().setCenter(firstDeviceCoordinates);
                mapInstanceRef.current.getView().setZoom(14);
            } else if (devices.length > 1) {
                const extent = vectorSourceRef.current.getExtent();
                mapInstanceRef.current.getView().fit(extent, { padding: [50, 50, 50, 50] });
            }
        }
    }, [deviceArr, isNightMode]);

    useEffect(() => {
        const fetchEntityStatus = async () => {
            if (clickValue) {
                const clickData = [
                    {
                        key: clickValue.label,
                        label: '设备名称',
                        content: clickValue.label,
                    },
                    {
                        key: 'address',
                        label: '设备地址',
                        content: clickValue.address.label,
                    },
                ];
                // 使用 Promise.all 并行处理所有异步请求
                const statusPromises = clickValue.entity.map(
                    async (item: { value: any; label: any }) => {
                        const [error, res] = await awaitWrap(
                            entityAPI.getEntityStatus({ id: item.value }),
                        );
                        if (error || !isRequestSuccess(res)) {
                            return null;
                        }
                        const entityStatus = getResponseData(res);
                        return {
                            key: item.value,
                            label: item.label,
                            content: entityStatus?.value || null,
                        };
                    },
                );
                try {
                    // 等待所有异步操作完成
                    const statusResults = await Promise.all(statusPromises);
                    // 过滤掉 null 值并将结果合并到 clickData 中
                    const validResults = statusResults.filter(result => result !== null);
                    clickData.push(...validResults);
                    setDescList(clickData);
                } catch (error) {
                    console.error('Error fetching entity statuses:', error);
                }
            }
        };
        fetchEntityStatus();
    }, [clickValue]);

    const handleClose = () => {
        setModalOpen(false);
        setClickValue(null);
        if (selectClickRef.current) {
            selectClickRef.current.getFeatures().clear();
        }
    };

    const handleToggleMode = () => {
        setLegendVisible(false);
        setIsNightMode(prevMode => !prevMode);
    };

    const handleLegendToggle = async () => {
        setLegendVisible(prevVisible => !prevVisible);

        if (!legendVisible) {
            try {
                const response = await fetch('/legendData.html');
                const data = await response.text();
                setLegendContent(data);
            } catch (error) {
                console.error('Error fetching HTML content:', error);
            }
        }
    };

    return (
        <div className={styles['map-container']}>
            <div ref={mapRef} className={styles.map} />
            <div className={styles.controls}>
                <button
                    type="button"
                    onClick={handleToggleMode}
                    className={styles['change-button']}
                >
                    {isNightMode ? 'Day Mode' : 'Night Mode'}
                </button>
            </div>
            {!isNightMode && (
                <div className={styles.controls2}>
                    <button
                        type="button"
                        onClick={handleLegendToggle}
                        className={styles['change-button2']}
                    >
                        {legendVisible ? 'Hide Legend' : 'Show Legend'}
                    </button>
                </div>
            )}
            {legendVisible && (
                <div
                    className={styles.legend}
                    dangerouslySetInnerHTML={{ __html: legendContent }}
                />
            )}
            <Modal
                visible={modalOpen}
                onCancel={handleClose}
                onOk={handleClose}
                width="700"
                onCancelText="Close"
            >
                {clickValue ? <Descriptions data={descList} /> : <p>No device selected.</p>}
            </Modal>
        </div>
    );
};

export default React.memo(MapComponent);
