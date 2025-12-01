import type { ControlPanelConfig } from '@/components/drawing-board/plugin/types';
import DeviceListIcon from '../Table.svg';

export interface DeviceListControlPanelConfig {
    devices?: { id: ApiKey; group_id: ApiKey }[];
}

/**
 * The Device List Control Panel Config
 */
const deviceListControlPanelConfig = (): ControlPanelConfig<DeviceListControlPanelConfig> => {
    return {
        class: 'operate',
        type: 'deviceList',
        name: 'dashboard.plugin_name_device_list',
        icon: DeviceListIcon,
        defaultCol: 4,
        defaultRow: 3,
        minCol: 3,
        minRow: 3,
        maxCol: 12,
        maxRow: 12,
        fullscreenable: true,
        fullscreenIconSx: {
            top: '10px',
        },
        configProps: [
            {
                label: 'Device List',
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
