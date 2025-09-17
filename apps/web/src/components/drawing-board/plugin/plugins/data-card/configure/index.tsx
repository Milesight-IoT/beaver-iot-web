import { forwardRef } from 'react';

// import { useActivityEntity } from '@/components/drawing-board/plugin/hooks';
import { ControlPanelContainer } from '@/components/drawing-board/plugin/render/control-panel';
import type { ControlPanelConfig, BoardPluginProps } from '@/components/drawing-board/plugin/types';
import type { ControlPanelContainerExposeProps } from '@/components/drawing-board/plugin/render/control-panel';
import controlPanel from '../control-panel';
// import { RenderConfig } from '../../../render';
// import { useConnect } from '../runtime';

import type { ViewConfigProps } from '../typings';

interface ConfigPluginProps {
    config: BoardPluginProps;
    onOk: (data: ViewConfigProps) => void;
    onChange: (data: ViewConfigProps) => void;
}

const Plugin = forwardRef<ControlPanelContainerExposeProps, ConfigPluginProps>((props, ref) => {
    const { onOk } = props;

    // const { getLatestEntityDetail } = useActivityEntity();
    // const latestEntity = useMemo(() => {
    //     if (!value.entity) return {};
    //     return getLatestEntityDetail(value.entity);
    // }, [value.entity, getLatestEntityDetail]) as EntityOptionType;

    // const { configure, handleChange } = useConnect({
    //     value: {
    //         ...value,
    //         entity: latestEntity,
    //     } as ViewConfigProps,
    //     config,
    //     onChange,
    // });

    // return (
    //     <RenderConfig
    //         value={value}
    //         config={configure}
    //         ref={ref}
    //         onOk={onOk}
    //         onChange={handleChange}
    //     />
    // );

    return (
        <ControlPanelContainer
            ref={ref}
            controlPanel={controlPanel as unknown as ControlPanelConfig}
            onOk={onOk as (data: AnyDict) => void}
        />
    );
});

export default Plugin;
