import { forwardRef } from 'react';
import { RenderConfig } from '../../../render';
import type { ConfigureType, ViewConfigProps } from '../typings';

interface ConfigPluginProps {
    value: ViewConfigProps;
    config: ConfigureType;
    onOk: (data: ViewConfigProps) => void;
    onChange: (data: ViewConfigProps) => void;
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
            value={value}
            onChange={onChange}
        />
    );
});

export default Plugin;
