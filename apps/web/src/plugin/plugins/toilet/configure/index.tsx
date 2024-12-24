/* eslint-disable no-console */
import { forwardRef } from 'react';
import { RenderConfig } from '../../../render';

interface ConfigPluginProps {
    onOk: (data: any) => void;
    onChange: (data: any) => void;
    config: CustomComponentProps;
    value: any;
}

// 创建一个内部组件来使用 context
const ConfigContent = forwardRef((props: ConfigPluginProps, ref: any) => {
    const { onOk, onChange, value, config } = props;

    const handleSubmit = (data: any) => {
        onOk({ ...data, ...value });
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

export default ConfigContent;
