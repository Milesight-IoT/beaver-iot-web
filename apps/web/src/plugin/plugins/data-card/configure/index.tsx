import { forwardRef } from 'react';

// import { useActivityEntity } from '@/plugin/hooks';
import { ControlPanelContainer } from '@/plugin/render/control-panel';
import type { ControlPanelConfig, DashboardPluginProps } from '@/plugin/types';
import type { ControlPanelContainerExposeProps } from '@/plugin/render/control-panel';
import controlPanel from '../control-panel';
// import { RenderConfig } from '../../../render';
// import { useConnect } from '../runtime';

import type { ViewConfigProps } from '../typings';

interface ConfigPluginProps {
    config: DashboardPluginProps;
    onOk: (data: ViewConfigProps) => void;
    onChange: (data: ViewConfigProps) => void;
}

const Plugin = forwardRef<ControlPanelContainerExposeProps, ConfigPluginProps>((props, ref) => {
    const { config, onOk, onChange } = props;

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
            initialValues={config?.config}
            controlPanel={controlPanel as unknown as ControlPanelConfig}
            onOk={onOk as (data: AnyDict) => void}
            onChange={onChange as (data: AnyDict) => void}
        />
    );
});

export default Plugin;
