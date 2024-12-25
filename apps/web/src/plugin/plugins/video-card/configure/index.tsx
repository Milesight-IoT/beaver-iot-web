import { forwardRef } from 'react';
import { RenderConfig } from '../../../render';
import { useConnect } from '../runtime';
import type { ConfigureType, ViewConfigProps } from '../typings';

interface ConfigPluginProps {
    value: ViewConfigProps;
    config: ConfigureType;
    onOk: (data: ViewConfigProps) => void;
    onChange: (data: ViewConfigProps) => void;
}
const Plugin = forwardRef((props: ConfigPluginProps, ref: any) => {
    const { value, config, onOk, onChange } = props;
    const { configure, handleChange } = useConnect({ value, config, onChange });

    return (
        <RenderConfig
            value={value}
            config={configure}
            ref={ref}
            onOk={onOk}
            onChange={handleChange}
        />
    );
});

export default Plugin;
