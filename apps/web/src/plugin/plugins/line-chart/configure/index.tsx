import { forwardRef } from 'react';
import { RenderConfig } from '../../../render';
import { useLineChartConfig } from './hooks';

interface ConfigPluginProps {
    config: CustomComponentProps;
    value: any;
    onOk: (data: any) => void;
    onChange: (data: any) => void;
}

const Plugin = forwardRef((props: ConfigPluginProps, ref: any) => {
    const { onOk, onChange, value, config } = props;

    const { newConfig } = useLineChartConfig(config);

    const handleSubmit = (data: any) => {
        onOk(data);
    };

    return (
        <RenderConfig
            config={newConfig}
            onOk={handleSubmit}
            ref={ref}
            onChange={onChange}
            value={value}
        />
    );
});

export default Plugin;
