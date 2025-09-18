import type { ControlPanelConfig } from '@/components/drawing-board/plugin/types';
import DeviceListIcon from '../Table.svg';

export interface DeviceListControlPanelConfig {
    devices: ApiKey[];
}

/**
 * The Device List Control Panel Config
 */
const deviceListControlPanelConfig = (): ControlPanelConfig<DeviceListControlPanelConfig> => {
    return {
        class: 'operate',
        type: 'deviceList',
        name: 'DeviceList',
        icon: DeviceListIcon,
        defaultCol: 4,
        defaultRow: 3,
        configProps: [
            {
                label: 'Hello',
                controlSetItems: [
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
                            },
                        },
                    },
                ],
            },
        ],
    };
};

export default deviceListControlPanelConfig;
