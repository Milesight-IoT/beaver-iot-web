import { useEffect } from 'react';
import { MarkerType, ViewConfigToiletProps } from './typings';
import './style.less';
// import MqttClient from '../components/mqtt';
import ImageEditor from '../components/ImageEditor';
import { ToiletProvider, useToiletContext } from '../components/ToiletContext';

interface Props {
    config: ViewConfigToiletProps;
    configJson: CustomComponentProps;
    onChange: (data: { imageUrl?: string; markers?: MarkerType[] }) => void;
}

const View = (props: Props) => {
    const { config, configJson, onChange } = props;
    const { setMarkers, setImageUrl } = useToiletContext();

    useEffect(() => {
        if (config?.markers) {
            setMarkers(config.markers);
        }
        if (config?.imageUrl) {
            setImageUrl(config.imageUrl);
        }
    }, [config, setImageUrl, setMarkers]);

    const { isPreview } = configJson;

    return (
        <div className="toilet-view-wrapper">
            {!isPreview ? <span className="toilet-view-title">{config.title}</span> : null}
            <ImageEditor onChange={onChange} config={config} isPreview={isPreview} />
            {/* <MqttClient /> */}
        </div>
    );
};

const ViewWrapper = (props: any) => {
    return (
        <ToiletProvider>
            <View {...props} />
        </ToiletProvider>
    );
};

export default ViewWrapper;
