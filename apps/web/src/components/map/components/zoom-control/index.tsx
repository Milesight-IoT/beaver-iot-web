import { ZoomControl as LZoomControl, useMap } from 'react-leaflet';
import './style.less';

/**
 * Map Zoom Control Component
 */
const ZoomControl = () => {
    const map = useMap();

    return <LZoomControl position="bottomright" />;
};

export default ZoomControl;
