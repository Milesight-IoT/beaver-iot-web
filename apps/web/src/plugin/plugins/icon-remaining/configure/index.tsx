import { forwardRef } from 'react';
import { RenderConfig } from '../../../render';
import { ConfigureType, ViewConfigProps } from '../typings';

interface ConfigPluginProps {
    value: ViewConfigProps;
    config: ConfigureType;
    onOk: (data: any) => void;
    onChange: (data: any) => void;
}

const Plugin = forwardRef((props: ConfigPluginProps, ref: any) => {
    const { value, config, onOk, onChange } = props;

    const handleSubmit = (data: any) => {
        onOk(data);
    };

    return (
        <RenderConfig
            config={config}
            onOk={handleSubmit}
            ref={ref}
            onChange={onChange}
            value={value}
        />
    );
});

export default Plugin;
