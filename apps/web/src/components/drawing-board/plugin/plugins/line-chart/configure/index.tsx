import { forwardRef } from 'react';

import { ControlPanelContainer } from '@/components/drawing-board/plugin/render/control-panel';
// import { RenderConfig } from '../../../render';
// import { useLineChartConfig } from './hooks';

import type { ControlPanelConfig, BoardPluginProps } from '@/components/drawing-board/plugin/types';
import type { ControlPanelContainerExposeProps } from '@/components/drawing-board/plugin/render/control-panel';
import controlPanel from '../control-panel';

interface ConfigPluginProps {
    config: BoardPluginProps;
    onOk: (data: AnyDict) => void;
    onChange: (data: AnyDict) => void;
}

const Plugin = forwardRef<ControlPanelContainerExposeProps, ConfigPluginProps>((props, ref) => {
    const { onOk } = props;

    // const { newConfig } = useLineChartConfig(config);

    // const handleSubmit = (data: any) => {
    //     onOk(data);
    // };

    // return (
    //     <RenderConfig
    //         config={newConfig}
    //         onOk={handleSubmit}
    //         ref={ref}
    //         onChange={onChange}
    //         value={value}
    //     />
    // );

    return (
        <ControlPanelContainer
            ref={ref}
            controlPanel={controlPanel as unknown as ControlPanelConfig}
            onOk={onOk}
        />
    );
});

export default Plugin;
