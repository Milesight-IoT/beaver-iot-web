import { t } from '@milesight/shared/src/utils/tools';

import type { ControlPanelConfig } from '@/components/drawing-board/plugin/types';
import type { DeviceSelectData } from '../../../components';
import AlarmIcon from '../Alarm.svg';

export interface AlarmConfigType {
    title?: string;
    devices?: DeviceSelectData[];
    defaultTime?: number;
}

/**
 * The Alarm Control Panel Config
 */
const alarmControlPanelConfig = (): ControlPanelConfig<AlarmConfigType> => {
    return {
        class: 'data_card',
        type: 'alarm',
        name: 'dashboard.plugin_name_alarm',
        icon: AlarmIcon,
        defaultRow: 4,
        defaultCol: 8,
        minRow: 4,
        minCol: 4,
        maxRow: 12,
        maxCol: 12,
        fullscreenable: true,
        configProps: [
            {
                label: 'alarm config',
                controlSetItems: [
                    {
                        name: 'input',
                        config: {
                            type: 'Input',
                            label: t('common.label.title'),
                            controllerProps: {
                                name: 'title',
                                defaultValue: t('dashboard.plugin_name_alarm'),
                                rules: {
                                    maxLength: 35,
                                },
                            },
                        },
                    },
                    {
                        name: 'alarmTimeSelect',
                        config: {
                            type: 'AlarmTimeSelect',
                            label: t('common.label.default_time'),
                            controllerProps: {
                                name: 'defaultTime',
                                defaultValue: 1440 * 60 * 1000 * 30,
                            },
                            componentProps: {
                                style: {
                                    width: '100%',
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
                                    height: '380px',
                                },
                            },
                        },
                    },
                ],
            },
        ],
    };
};

export default alarmControlPanelConfig;
