import { t } from '@milesight/shared/src/utils/tools';

import type { ControlPanelConfig } from '@/components/drawing-board/plugin/types';
import type { DeviceSelectData } from '../../../components/multi-device-select/interface';
import MapIcon from '../Map.svg';

export interface MapConfigType {
    title: string;
    devices?: DeviceSelectData[];
}

/**
 * The Map Control Panel Config
 */
const mapControlPanelConfig = (): ControlPanelConfig<MapConfigType> => {
    return {
        class: 'data_card',
        type: 'map',
        name: 'map',
        icon: MapIcon,
        defaultRow: 4,
        defaultCol: 4,
        minRow: 3,
        minCol: 3,
        maxRow: 12,
        maxCol: 12,
        configProps: [
            {
                label: 'map config',
                controlSetItems: [
                    {
                        name: 'input',
                        config: {
                            type: 'Input',
                            label: t('common.label.title'),
                            controllerProps: {
                                name: 'title',
                                defaultValue: t('dashboard.plugin_name_map'),
                                rules: {
                                    maxLength: 35,
                                },
                            },
                        },
                    },
                    {
                        name: 'multiDeviceSelect',
                        config: {
                            type: 'MultiDeviceSelect',
                            controllerProps: {
                                name: 'devices',
                                rules: {
                                    required: true,
                                },
                            },
                            componentProps: {
                                required: true,
                                sx: {
                                    height: 'calc(100% - 78px)',
                                },
                            },
                        },
                    },
                ],
            },
        ],
    };
};

export default mapControlPanelConfig;
