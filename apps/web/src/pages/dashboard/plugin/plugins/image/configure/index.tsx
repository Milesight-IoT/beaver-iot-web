import { forwardRef } from 'react';

import { ControlPanelContainer } from '@/pages/dashboard/plugin/render/control-panel';
// import useFormData from './useFormData';
// import { RenderConfig } from '../../../render';

// import type { ImageConfigType } from '../typings';
import type { ControlPanelConfig, DashboardPluginProps } from '@/pages/dashboard/plugin/types';
import type { ControlPanelContainerExposeProps } from '@/pages/dashboard/plugin/render/control-panel';
import controlPanel from '../control-panel';

interface ConfigPluginProps {
    config: DashboardPluginProps;
    onOk: (data: AnyDict) => void;
    onChange: (data: AnyDict) => void;
}

const Plugin = forwardRef<ControlPanelContainerExposeProps, ConfigPluginProps>((props, ref) => {
    const { onOk } = props;
    // const [resultValue, resultConfig] = useFormData(value, config);

    // const handleSubmit = (data: any) => {
    //     onOk(data);
    // };

    // const handleChange = useCallback(
    //     (data: ImageConfigType) => {
    //         switch (data.dataType) {
    //             case 'entity': {
    //                 onChange({
    //                     ...data,
    //                     file: null,
    //                     url: null,
    //                 });
    //                 break;
    //             }
    //             case 'upload': {
    //                 onChange({
    //                     ...data,
    //                     entity: null,
    //                     url: null,
    //                 });
    //                 break;
    //             }
    //             case 'url': {
    //                 onChange({
    //                     ...data,
    //                     entity: null,
    //                     file: null,
    //                 });
    //                 break;
    //             }
    //             default: {
    //                 onChange(data);
    //                 break;
    //             }
    //         }
    //     },
    //     [onChange],
    // );

    // useEffect(() => {
    //     const setValue = ref?.current?.setValue;
    //     if (!setValue) return;

    //     // Hack: Reset the url/entity value to fix the validate error
    //     switch (resultValue.dataType) {
    //         case 'entity': {
    //             setValue('entity', resultValue.entity);
    //             break;
    //         }
    //         case 'url': {
    //             setValue('url', resultValue.url);
    //             break;
    //         }
    //         default: {
    //             break;
    //         }
    //     }
    // }, [resultValue, ref]);

    // return (
    //     <RenderConfig
    //         config={resultConfig}
    //         onOk={handleSubmit}
    //         ref={ref}
    //         onChange={handleChange}
    //         value={resultValue}
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
