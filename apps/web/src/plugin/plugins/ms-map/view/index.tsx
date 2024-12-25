import React, { useEffect, useRef, useState } from 'react';

// import 'ol/ol.css';
// import { Map, View as OlView, Feature } from 'ol';
// import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
// import { OSM, Vector as VectorSource } from 'ol/source';
// import { fromLonLat } from 'ol/proj';
// import { Point } from 'ol/geom';
// import { Icon, Style } from 'ol/style';

import { Tooltip } from '@/plugin/view-components';
import styles from './style.module.less';
import MapComponent from './map-component';

export interface ViewProps {
    config: {
        entity?: EntityOptionType[];
        title?: string;
        time: number;
    };
    configJson: {
        isPreview?: boolean;
    };
}

const View = (props: ViewProps) => {
    const { config, configJson } = props;
    const { entity, title, time } = config || {};
    // console.log('🚀 ~ View ~ config:', config);
    const { isPreview } = configJson || {};
    /**
     * map ref
     */
    // const mapRef = useRef<HTMLDivElement>(null);
    // const [map, setMap] = useState<Map>();
    // const [vectorSource, setVectorSource] = useState(new VectorSource());

    useEffect(() => {
        // // 创建地图
        // const initialMap = new Map({
        //     target: mapRef.current as HTMLElement,
        //     layers: [
        //         // 创建一个使用Open Street Map地图源的瓦片图层
        //         new TileLayer({
        //             source: new OSM(),
        //         }),
        //         new VectorLayer({
        //             source: vectorSource,
        //         }),
        //     ],
        //     // 设置显示地图的视图
        //     view: new OlView({
        //         center: fromLonLat([0, 0]), // 定义地图显示中心于经度0度，纬度0度处
        //         zoom: 2, // 并且定义地图显示层级为2
        //     }),
        // });
        // setMap(initialMap);
    }, []);

    return (
        <div className={styles['map-wrapper']}>
            <Tooltip className={styles.name} autoEllipsis title={title} />
            <MapComponent chooseData={props} />
            {/* <div className={styles['map-content']}>
                <div ref={mapRef} className={styles['ms-map']} />
            </div> */}
        </div>
    );
};

export default React.memo(View);
