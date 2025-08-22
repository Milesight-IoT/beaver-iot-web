const data = {
    dashboard_id: '1886945061565251586',
    user_id: '1851504171887779842',
    name: 'Jufon',
    home: false,
    created_at: '1738717735086',
    widgets: [
        {
            widget_id: '1955471495704649729',
            data: {
                type: 'iconRemaining',
                name: 'Remaining',
                class: 'data_chart',
                icon: './icon.svg',
                defaultRow: 1,
                defaultCol: 2,
                minRow: 1,
                minCol: 2,
                maxRow: 1,
                configProps: [
                    {
                        style: 'width: 100%',
                        theme: {
                            default: {
                                style: 'font-size: 18px;',
                            },
                        },
                        components: [
                            {
                                type: 'entitySelect',
                                title: 'Entity',
                                key: 'entity',
                                style: 'width: 100%',
                                getDataUrl: '',
                                componentProps: {
                                    entityType: ['PROPERTY'],
                                    entityValueTypes: ['LONG', 'DOUBLE'],
                                    entityAccessMod: ['R', 'RW'],
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        components: [
                            {
                                type: 'input',
                                title: 'Title',
                                key: 'title',
                                style: 'width: 100%',
                                defaultValue: 'Title',
                                componentProps: {
                                    inputProps: {
                                        maxLength: 35,
                                    },
                                },
                            },
                        ],
                    },
                    {
                        style: 'width: 100%;',
                        components: [
                            {
                                type: 'ChartTimeSelect',
                                title: 'Time',
                                key: 'time',
                                style: 'width: 100%;',
                                defaultValue: 86400000,
                            },
                        ],
                    },
                    {
                        style: 'width: 100%;',
                        components: [
                            {
                                type: 'chartMetricsSelect',
                                title: 'metrics',
                                key: 'metrics',
                                style: 'width: 100%;',
                                defaultValue: 'LAST',
                                filters: ['SUM', 'COUNT'],
                            },
                        ],
                    },
                    {
                        title: 'Appearance',
                        style: 'display: flex;',
                        components: [
                            {
                                type: 'iconSelect',
                                key: 'icon',
                                style: 'flex: 1;padding-right: 12px;',
                                defaultValue: 'DeleteIcon',
                            },
                            {
                                type: 'iconColorSelect',
                                key: 'iconColor',
                                style: 'flex: 1;',
                                defaultValue: '#8E66FF',
                            },
                        ],
                    },
                ],
                view: [],
                iconSrc: {
                    default: '/src/plugin/plugins/icon-remaining/icon.svg',
                },
                config: {
                    title: 'Title new',
                    time: 15552000000,
                    metrics: 'AVG',
                    entity: {
                        value: '1920653175522988045',
                        label: 'Distance',
                        valueType: 'LONG',
                        description: 'PROPERTY, DEMO_EM500-UDL-C100',
                        rawData: {
                            deviceName: 'DEMO_EM500-UDL-C100',
                            integrationName: 'Milesight Development Platform',
                            entityId: '1920653175522988045',
                            entityAccessMod: 'R',
                            entityKey: 'msc-integration.device.DEMO_1920653046498713602.distance',
                            entityType: 'PROPERTY',
                            entityName: 'Distance',
                            entityValueAttribute: {
                                unit: 'mm',
                                min: 250,
                                max: 8000,
                            },
                            entityValueType: 'LONG',
                            entityIsCustomized: false,
                            entityCreatedAt: 1746754375759,
                            entityUpdatedAt: 1747033755938,
                        },
                    },
                    appearanceIcon: {
                        icon: 'IotOccupancyStatusWS203TwoIcon',
                        color: '#ff975eff',
                    },
                },
                pos: {
                    w: 2,
                    h: 1,
                    x: 9,
                    y: 3,
                    i: '1955471495704649729',
                    minW: 2,
                    maxW: 3,
                    minH: 1,
                    maxH: 1,
                    moved: false,
                    static: false,
                },
            },
        },
        {
            widget_id: '1953654797514870786',
            data: {
                type: 'lineChart',
                name: 'Line',
                class: 'data_chart',
                icon: './icon.svg',
                defaultRow: 4,
                defaultCol: 4,
                minRow: 2,
                minCol: 2,
                configProps: [
                    {
                        components: [
                            {
                                type: 'input',
                                title: 'Title',
                                key: 'title',
                                defaultValue: 'Title',
                                componentProps: {
                                    inputProps: {
                                        maxLength: 35,
                                    },
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'chartEntityPosition',
                                title: 'entityPosition',
                                key: 'entityPosition',
                                defaultValue: '',
                                style: 'width: 100%',
                                getDataUrl: '',
                                valueType: 'array',
                                componentProps: {
                                    entityType: ['PROPERTY'],
                                    entityValueTypes: ['LONG', 'DOUBLE'],
                                    entityAccessMod: ['R', 'RW'],
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        style: 'width: 100%;',
                        components: [
                            {
                                type: 'ChartTimeSelect',
                                title: 'Time',
                                key: 'time',
                                defaultValue: 86400000,
                                style: 'width: 100%;',
                            },
                        ],
                    },
                ],
                view: [],
                iconSrc: {
                    default: '/src/plugin/plugins/line-chart/icon.svg',
                },
                config: {
                    title: 'Title 123',
                    entityPosition: [
                        {
                            id: '1852267466534055948',
                            entity: {
                                value: '1852267466534055948',
                                label: 'Humidity',
                                valueType: 'DOUBLE',
                                description: 'PROPERTY',
                                rawData: {
                                    deviceName: 'AM308',
                                    integrationName: 'Milesight Development Platform',
                                    entityId: '1852267466534055948',
                                    entityAccessMod: 'R',
                                    entityKey:
                                        'msc-integration.device.DEMO_1852227367394222081.humidity',
                                    entityType: 'PROPERTY',
                                    entityName: 'Humidity',
                                    entityValueAttribute: {
                                        fractionDigits: 1,
                                        unit: '%RH',
                                        min: 0,
                                        max: 100,
                                    },
                                    entityValueType: 'DOUBLE',
                                    entityIsCustomized: false,
                                    entityCreatedAt: 1730449952161,
                                    entityUpdatedAt: 1730449952161,
                                },
                            },
                            position: 1,
                        },
                        {
                            id: '1852267466534055954',
                            entity: {
                                value: '1852267466534055954',
                                label: 'PM10',
                                valueType: 'LONG',
                                description: 'PROPERTY',
                                rawData: {
                                    deviceName: 'AM308',
                                    integrationName: 'Milesight Development Platform',
                                    entityId: '1852267466534055954',
                                    entityAccessMod: 'R',
                                    entityKey:
                                        'msc-integration.device.DEMO_1852227367394222081.pm10',
                                    entityType: 'PROPERTY',
                                    entityName: 'PM10',
                                    entityValueAttribute: {
                                        unit: 'ug/m3',
                                    },
                                    entityValueType: 'LONG',
                                    entityIsCustomized: false,
                                    entityCreatedAt: 1730449952166,
                                    entityUpdatedAt: 1730449952166,
                                },
                            },
                            position: 2,
                        },
                    ],
                    time: 86400000,
                    leftYAxisUnit: 'PM2.5(ug/m3) 668',
                    rightYAxisUnit: 'PM10(ug/m3) 666',
                },
                pos: {
                    w: 4,
                    h: 4,
                    x: 0,
                    y: 12,
                    i: '1953654797514870786',
                    minW: 2,
                    maxW: 12,
                    minH: 2,
                    moved: false,
                    static: false,
                },
            },
        },
        {
            widget_id: '1952611725533609985',
            data: {
                type: 'lineChart',
                name: 'Line',
                class: 'data_chart',
                icon: './icon.svg',
                defaultRow: 4,
                defaultCol: 4,
                minRow: 2,
                minCol: 2,
                configProps: [
                    {
                        components: [
                            {
                                type: 'input',
                                title: 'Title',
                                key: 'title',
                                defaultValue: 'Title',
                                componentProps: {
                                    inputProps: {
                                        maxLength: 35,
                                    },
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'chartEntityPosition',
                                title: 'entityPosition',
                                key: 'entityPosition',
                                defaultValue: '',
                                style: 'width: 100%',
                                getDataUrl: '',
                                valueType: 'array',
                                componentProps: {
                                    entityType: ['PROPERTY'],
                                    entityValueTypes: ['LONG', 'DOUBLE'],
                                    entityAccessMod: ['R', 'RW'],
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        style: 'width: 100%;',
                        components: [
                            {
                                type: 'ChartTimeSelect',
                                title: 'Time',
                                key: 'time',
                                defaultValue: 86400000,
                                style: 'width: 100%;',
                            },
                        ],
                    },
                ],
                view: [],
                iconSrc: {
                    default: '/src/plugin/plugins/line-chart/icon.svg',
                },
                config: {
                    title: 'Test Line',
                    entityPosition: [
                        {
                            id: '1905158947900743721',
                            entity: {
                                value: '1905158947900743721',
                                label: 'Temperature',
                                valueType: 'DOUBLE',
                                description: 'PROPERTY',
                                rawData: {
                                    deviceName: 'DEMO_AM308L',
                                    integrationName: 'Milesight Development Platform',
                                    entityId: '1905158947900743721',
                                    entityAccessMod: 'R',
                                    entityKey:
                                        'msc-integration.device.DEMO_1905158671063425025.temperature',
                                    entityType: 'PROPERTY',
                                    entityName: 'Temperature',
                                    entityValueAttribute: {
                                        fractionDigits: 1,
                                        unit: '°C',
                                        min: -20,
                                        max: 60,
                                    },
                                    entityValueType: 'DOUBLE',
                                    entityIsCustomized: false,
                                    entityCreatedAt: 1743060264168,
                                    entityUpdatedAt: 1743060264168,
                                },
                            },
                            position: 1,
                        },
                    ],
                    time: 31536000000,
                    leftYAxisUnit: 'Temperature',
                },
                pos: {
                    w: 8,
                    h: 4,
                    x: 0,
                    y: 0,
                    i: '1952611725533609985',
                    minW: 2,
                    maxW: 12,
                    minH: 2,
                    moved: false,
                    static: false,
                },
            },
        },
        {
            widget_id: '1955506571464048641',
            data: {
                type: 'radarChart',
                name: 'Radar',
                class: 'data_chart',
                icon: './icon.svg',
                defaultRow: 4,
                defaultCol: 4,
                minRow: 2,
                minCol: 2,
                configProps: [
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'multiEntitySelect',
                                title: 'Entity',
                                key: 'entityList',
                                style: 'width: 100%',
                                getDataUrl: '',
                                valueType: 'array',
                                componentProps: {
                                    entityType: ['PROPERTY'],
                                    entityValueTypes: ['LONG', 'DOUBLE'],
                                    entityAccessMod: ['R', 'RW'],
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        components: [
                            {
                                type: 'input',
                                title: 'Title',
                                key: 'title',
                                style: 'width: 100%',
                                defaultValue: 'Title',
                                componentProps: {
                                    inputProps: {
                                        maxLength: 35,
                                    },
                                },
                            },
                        ],
                    },
                    {
                        style: 'width: 100%;',
                        components: [
                            {
                                type: 'ChartTimeSelect',
                                title: 'Time',
                                key: 'time',
                                style: 'width: 100%;',
                                defaultValue: 86400000,
                            },
                        ],
                    },
                    {
                        style: 'width: 100%;',
                        components: [
                            {
                                type: 'chartMetricsSelect',
                                title: 'metrics',
                                key: 'metrics',
                                style: 'width: 100%;',
                                defaultValue: 'LAST',
                                filters: ['SUM', 'COUNT'],
                            },
                        ],
                    },
                ],
                view: [],
                iconSrc: {
                    default: '/src/plugin/plugins/radar-chart/icon.svg',
                },
                config: {
                    title: 'Title radar 666',
                    time: 31536000000,
                    metrics: 'AVG',
                    entityList: [
                        {
                            value: '1920653175522988045',
                            label: 'Distance',
                            valueType: 'LONG',
                            description: 'PROPERTY, DEMO_EM500-UDL-C100',
                            rawData: {
                                deviceName: 'DEMO_EM500-UDL-C100',
                                integrationName: 'Milesight Development Platform',
                                entityId: '1920653175522988045',
                                entityAccessMod: 'R',
                                entityKey:
                                    'msc-integration.device.DEMO_1920653046498713602.distance',
                                entityType: 'PROPERTY',
                                entityName: 'Distance',
                                entityValueAttribute: {
                                    unit: 'mm',
                                    min: 250,
                                    max: 8000,
                                },
                                entityValueType: 'LONG',
                                entityIsCustomized: false,
                                entityCreatedAt: 1746754375759,
                                entityUpdatedAt: 1747033755938,
                            },
                        },
                        {
                            value: '1852267466534055947',
                            label: 'Temperature',
                            valueType: 'DOUBLE',
                            description: 'PROPERTY, AM308',
                            rawData: {
                                deviceName: 'AM308',
                                integrationName: 'Milesight Development Platform',
                                entityId: '1852267466534055947',
                                entityAccessMod: 'R',
                                entityKey:
                                    'msc-integration.device.DEMO_1852227367394222081.temperature',
                                entityType: 'PROPERTY',
                                entityName: 'Temperature',
                                entityValueAttribute: {
                                    fractionDigits: 1,
                                    unit: '°C',
                                    min: -20,
                                    max: 60,
                                },
                                entityValueType: 'DOUBLE',
                                entityIsCustomized: false,
                                entityCreatedAt: 1730449952160,
                                entityUpdatedAt: 1730449952160,
                            },
                        },
                        {
                            value: '1852267466534055948',
                            label: 'Humidity',
                            valueType: 'DOUBLE',
                            description: 'PROPERTY, AM308',
                            rawData: {
                                deviceName: 'AM308',
                                integrationName: 'Milesight Development Platform',
                                entityId: '1852267466534055948',
                                entityAccessMod: 'R',
                                entityKey:
                                    'msc-integration.device.DEMO_1852227367394222081.humidity',
                                entityType: 'PROPERTY',
                                entityName: 'Humidity',
                                entityValueAttribute: {
                                    fractionDigits: 1,
                                    unit: '%RH',
                                    min: 0,
                                    max: 100,
                                },
                                entityValueType: 'DOUBLE',
                                entityIsCustomized: false,
                                entityCreatedAt: 1730449952161,
                                entityUpdatedAt: 1730449952161,
                            },
                        },
                        {
                            value: '1852267466534055946',
                            label: 'PM2.5',
                            valueType: 'LONG',
                            description: 'PROPERTY, AM308',
                            rawData: {
                                deviceName: 'AM308',
                                integrationName: 'Milesight Development Platform',
                                entityId: '1852267466534055946',
                                entityAccessMod: 'R',
                                entityKey: 'msc-integration.device.DEMO_1852227367394222081.pm2_5',
                                entityType: 'PROPERTY',
                                entityName: 'PM2.5',
                                entityValueAttribute: {
                                    unit: 'ug/m3',
                                },
                                entityValueType: 'LONG',
                                entityIsCustomized: false,
                                entityCreatedAt: 1730449952159,
                                entityUpdatedAt: 1730449952159,
                            },
                        },
                        {
                            value: '1852267466534055954',
                            label: 'PM10',
                            valueType: 'LONG',
                            description: 'PROPERTY',
                            rawData: {
                                deviceName: 'AM308',
                                integrationName: 'Milesight Development Platform',
                                entityId: '1852267466534055954',
                                entityAccessMod: 'R',
                                entityKey: 'msc-integration.device.DEMO_1852227367394222081.pm10',
                                entityType: 'PROPERTY',
                                entityName: 'PM10',
                                entityValueAttribute: {
                                    unit: 'ug/m3',
                                },
                                entityValueType: 'LONG',
                                entityIsCustomized: false,
                                entityCreatedAt: 1730449952166,
                                entityUpdatedAt: 1730449952166,
                            },
                        },
                    ],
                },
                pos: {
                    w: 4,
                    h: 4,
                    x: 0,
                    y: 24,
                    i: '1955506571464048641',
                    minW: 2,
                    maxW: 12,
                    minH: 2,
                    moved: false,
                    static: false,
                },
            },
        },
        {
            widget_id: '1955512142124711938',
            data: {
                type: 'iconRemaining',
                name: 'Remaining',
                class: 'data_chart',
                icon: './icon.svg',
                defaultRow: 1,
                defaultCol: 2,
                minRow: 1,
                minCol: 2,
                maxRow: 1,
                configProps: [
                    {
                        style: 'width: 100%',
                        theme: {
                            default: {
                                style: 'font-size: 18px;',
                            },
                        },
                        components: [
                            {
                                type: 'entitySelect',
                                title: 'Entity',
                                key: 'entity',
                                style: 'width: 100%',
                                getDataUrl: '',
                                componentProps: {
                                    entityType: ['PROPERTY'],
                                    entityValueTypes: ['LONG', 'DOUBLE'],
                                    entityAccessMod: ['R', 'RW'],
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        components: [
                            {
                                type: 'input',
                                title: 'Title',
                                key: 'title',
                                style: 'width: 100%',
                                defaultValue: 'Title',
                                componentProps: {
                                    inputProps: {
                                        maxLength: 35,
                                    },
                                },
                            },
                        ],
                    },
                    {
                        style: 'width: 100%;',
                        components: [
                            {
                                type: 'ChartTimeSelect',
                                title: 'Time',
                                key: 'time',
                                style: 'width: 100%;',
                                defaultValue: 86400000,
                            },
                        ],
                    },
                    {
                        style: 'width: 100%;',
                        components: [
                            {
                                type: 'chartMetricsSelect',
                                title: 'metrics',
                                key: 'metrics',
                                style: 'width: 100%;',
                                defaultValue: 'LAST',
                                filters: ['SUM', 'COUNT'],
                            },
                        ],
                    },
                    {
                        title: 'Appearance',
                        style: 'display: flex;',
                        components: [
                            {
                                type: 'iconSelect',
                                key: 'icon',
                                style: 'flex: 1;padding-right: 12px;',
                                defaultValue: 'DeleteIcon',
                            },
                            {
                                type: 'iconColorSelect',
                                key: 'iconColor',
                                style: 'flex: 1;',
                                defaultValue: '#8E66FF',
                            },
                        ],
                    },
                ],
                view: [],
                iconSrc: {
                    default: '/src/plugin/plugins/icon-remaining/icon.svg',
                },
                config: {
                    title: 'Title default',
                    time: 31536000000,
                    metrics: 'MAX',
                    entity: {
                        value: '1920653175522988045',
                        label: 'Distance',
                        valueType: 'LONG',
                        description: 'PROPERTY, DEMO_EM500-UDL-C100',
                        rawData: {
                            deviceName: 'DEMO_EM500-UDL-C100',
                            integrationName: 'Milesight Development Platform',
                            entityId: '1920653175522988045',
                            entityAccessMod: 'R',
                            entityKey: 'msc-integration.device.DEMO_1920653046498713602.distance',
                            entityType: 'PROPERTY',
                            entityName: 'Distance',
                            entityValueAttribute: {
                                unit: 'mm',
                                min: 250,
                                max: 8000,
                            },
                            entityValueType: 'LONG',
                            entityIsCustomized: false,
                            entityCreatedAt: 1746754375759,
                            entityUpdatedAt: 1747033755938,
                        },
                    },
                    appearanceIcon: {
                        icon: 'IotLiquidLevelStatusFullIcon',
                    },
                },
                pos: {
                    w: 2,
                    h: 1,
                    x: 0,
                    y: 28,
                    i: '1955512142124711938',
                    minW: 2,
                    maxW: 12,
                    minH: 1,
                    maxH: 1,
                    moved: false,
                    static: false,
                },
            },
        },
        {
            widget_id: '1955256466647449602',
            data: {
                type: 'barChart',
                name: 'Bar',
                class: 'data_chart',
                icon: './icon.svg',
                defaultRow: 4,
                defaultCol: 4,
                minRow: 2,
                minCol: 2,
                configProps: [
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'multiEntitySelect',
                                title: 'Entity',
                                key: 'entity',
                                style: 'width: 100%',
                                getDataUrl: '',
                                valueType: 'array',
                                componentProps: {
                                    entityType: ['PROPERTY'],
                                    entityValueTypes: ['LONG', 'DOUBLE'],
                                    entityAccessMod: ['R', 'RW'],
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        components: [
                            {
                                type: 'input',
                                title: 'Title',
                                key: 'title',
                                defaultValue: 'Title',
                                componentProps: {
                                    inputProps: {
                                        maxLength: 35,
                                    },
                                },
                            },
                        ],
                    },
                    {
                        style: 'width: 100%;',
                        components: [
                            {
                                type: 'ChartTimeSelect',
                                title: 'Time',
                                key: 'time',
                                style: 'width: 100%;',
                                defaultValue: 86400000,
                            },
                        ],
                    },
                ],
                view: [],
                iconSrc: {
                    default: '/src/plugin/plugins/bar-chart/icon.svg',
                },
                config: {
                    title: 'Title bar 168',
                    time: 31536000000,
                    entity: [
                        {
                            value: '1852267466534055948',
                            label: 'Humidity',
                            valueType: 'DOUBLE',
                            description: 'PROPERTY, AM308',
                            rawData: {
                                deviceName: 'AM308',
                                integrationName: 'Milesight Development Platform',
                                entityId: '1852267466534055948',
                                entityAccessMod: 'R',
                                entityKey:
                                    'msc-integration.device.DEMO_1852227367394222081.humidity',
                                entityType: 'PROPERTY',
                                entityName: 'Humidity',
                                entityValueAttribute: {
                                    fractionDigits: 1,
                                    unit: '%RH',
                                    min: 0,
                                    max: 100,
                                },
                                entityValueType: 'DOUBLE',
                                entityIsCustomized: false,
                                entityCreatedAt: 1730449952161,
                                entityUpdatedAt: 1730449952161,
                            },
                        },
                        {
                            value: '1852267466534055947',
                            label: 'Temperature',
                            valueType: 'DOUBLE',
                            description: 'PROPERTY',
                            rawData: {
                                deviceName: 'AM308',
                                integrationName: 'Milesight Development Platform',
                                entityId: '1852267466534055947',
                                entityAccessMod: 'R',
                                entityKey:
                                    'msc-integration.device.DEMO_1852227367394222081.temperature',
                                entityType: 'PROPERTY',
                                entityName: 'Temperature',
                                entityValueAttribute: {
                                    fractionDigits: 1,
                                    unit: '°C',
                                    min: -20,
                                    max: 60,
                                },
                                entityValueType: 'DOUBLE',
                                entityIsCustomized: false,
                                entityCreatedAt: 1730449952160,
                                entityUpdatedAt: 1730449952160,
                            },
                        },
                    ],
                },
                pos: {
                    w: 4,
                    h: 4,
                    x: 5,
                    y: 8,
                    i: '1955256466647449602',
                    minW: 2,
                    maxW: 7,
                    minH: 2,
                    moved: false,
                    static: false,
                },
            },
        },
        {
            widget_id: '1953650659218518017',
            data: {
                type: 'lineChart',
                name: 'Line',
                class: 'data_chart',
                icon: './icon.svg',
                defaultRow: 4,
                defaultCol: 4,
                minRow: 2,
                minCol: 2,
                configProps: [
                    {
                        components: [
                            {
                                type: 'input',
                                title: 'Title',
                                key: 'title',
                                defaultValue: 'Title',
                                componentProps: {
                                    inputProps: {
                                        maxLength: 35,
                                    },
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'chartEntityPosition',
                                title: 'entityPosition',
                                key: 'entityPosition',
                                defaultValue: '',
                                style: 'width: 100%',
                                getDataUrl: '',
                                valueType: 'array',
                                componentProps: {
                                    entityType: ['PROPERTY'],
                                    entityValueTypes: ['LONG', 'DOUBLE'],
                                    entityAccessMod: ['R', 'RW'],
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        style: 'width: 100%;',
                        components: [
                            {
                                type: 'ChartTimeSelect',
                                title: 'Time',
                                key: 'time',
                                defaultValue: 86400000,
                                style: 'width: 100%;',
                            },
                        ],
                    },
                ],
                view: [],
                iconSrc: {
                    default: '/src/plugin/plugins/line-chart/icon.svg',
                },
                config: {
                    title: 'Title',
                    entityPosition: [
                        {
                            id: '1852267466534055939',
                            entity: {
                                value: '1852267466534055939',
                                label: 'CO₂',
                                valueType: 'LONG',
                                description: 'PROPERTY',
                                rawData: {
                                    deviceName: 'AM308',
                                    integrationName: 'Milesight Development Platform',
                                    entityId: '1852267466534055939',
                                    entityAccessMod: 'R',
                                    entityKey:
                                        'msc-integration.device.DEMO_1852227367394222081.co2',
                                    entityType: 'PROPERTY',
                                    entityName: 'CO₂',
                                    entityValueAttribute: {
                                        fractionDigits: 0,
                                        unit: 'ppm',
                                        min: 0,
                                        max: 10000,
                                    },
                                    entityValueType: 'LONG',
                                    entityIsCustomized: false,
                                    entityCreatedAt: 1730449952152,
                                    entityUpdatedAt: 1730449952152,
                                },
                            },
                            position: 2,
                        },
                        {
                            id: '1852267466534055947',
                            entity: {
                                value: '1852267466534055947',
                                label: 'Temperature',
                                valueType: 'DOUBLE',
                                description: 'PROPERTY',
                                rawData: {
                                    deviceName: 'AM308',
                                    integrationName: 'Milesight Development Platform',
                                    entityId: '1852267466534055947',
                                    entityAccessMod: 'R',
                                    entityKey:
                                        'msc-integration.device.DEMO_1852227367394222081.temperature',
                                    entityType: 'PROPERTY',
                                    entityName: 'Temperature',
                                    entityValueAttribute: {
                                        fractionDigits: 1,
                                        unit: '°C',
                                        min: -20,
                                        max: 60,
                                    },
                                    entityValueType: 'DOUBLE',
                                    entityIsCustomized: false,
                                    entityCreatedAt: 1730449952160,
                                    entityUpdatedAt: 1730449952160,
                                },
                            },
                            position: 1,
                        },
                    ],
                    time: 86400000,
                    leftYAxisUnit: 'Temperature(°C) hello',
                    rightYAxisUnit: 'hello',
                },
                pos: {
                    w: 4,
                    h: 4,
                    x: 0,
                    y: 8,
                    i: '1953650659218518017',
                    minW: 2,
                    maxW: 12,
                    minH: 2,
                    moved: false,
                    static: false,
                },
            },
        },
        {
            widget_id: '1955454606021394434',
            data: {
                type: 'horizonBarChart',
                name: 'Horizon Bar',
                class: 'data_chart',
                icon: './icon.svg',
                defaultRow: 4,
                defaultCol: 4,
                minRow: 2,
                minCol: 2,
                configProps: [
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'multiEntitySelect',
                                title: 'Entity',
                                key: 'entity',
                                style: 'width: 100%',
                                getDataUrl: '',
                                valueType: 'array',
                                componentProps: {
                                    entityType: ['PROPERTY'],
                                    entityValueTypes: ['LONG', 'DOUBLE'],
                                    entityAccessMod: ['R', 'RW'],
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        components: [
                            {
                                type: 'input',
                                title: 'Title',
                                key: 'title',
                                defaultValue: 'Title',
                                componentProps: {
                                    inputProps: {
                                        maxLength: 35,
                                    },
                                },
                            },
                        ],
                    },
                    {
                        style: 'width: 100%;',
                        components: [
                            {
                                type: 'ChartTimeSelect',
                                title: 'Time',
                                key: 'time',
                                style: 'width: 100%;',
                                defaultValue: 86400000,
                            },
                        ],
                    },
                ],
                view: [],
                iconSrc: {
                    default: '/src/plugin/plugins/horizon-bar-chart/icon.svg',
                },
                config: {
                    title: 'Title horizon bar',
                    time: 31536000000,
                    entity: [
                        {
                            value: '1852267466534055948',
                            label: 'Humidity',
                            valueType: 'DOUBLE',
                            description: 'PROPERTY, AM308',
                            rawData: {
                                deviceName: 'AM308',
                                integrationName: 'Milesight Development Platform',
                                entityId: '1852267466534055948',
                                entityAccessMod: 'R',
                                entityKey:
                                    'msc-integration.device.DEMO_1852227367394222081.humidity',
                                entityType: 'PROPERTY',
                                entityName: 'Humidity',
                                entityValueAttribute: {
                                    fractionDigits: 1,
                                    unit: '%RH',
                                    min: 0,
                                    max: 100,
                                },
                                entityValueType: 'DOUBLE',
                                entityIsCustomized: false,
                                entityCreatedAt: 1730449952161,
                                entityUpdatedAt: 1730449952161,
                            },
                        },
                        {
                            value: '1852267466534055947',
                            label: 'Temperature',
                            valueType: 'DOUBLE',
                            description: 'PROPERTY',
                            rawData: {
                                deviceName: 'AM308',
                                integrationName: 'Milesight Development Platform',
                                entityId: '1852267466534055947',
                                entityAccessMod: 'R',
                                entityKey:
                                    'msc-integration.device.DEMO_1852227367394222081.temperature',
                                entityType: 'PROPERTY',
                                entityName: 'Temperature',
                                entityValueAttribute: {
                                    fractionDigits: 1,
                                    unit: '°C',
                                    min: -20,
                                    max: 60,
                                },
                                entityValueType: 'DOUBLE',
                                entityIsCustomized: false,
                                entityCreatedAt: 1730449952160,
                                entityUpdatedAt: 1730449952160,
                            },
                        },
                    ],
                },
                pos: {
                    w: 4,
                    h: 4,
                    x: 5,
                    y: 16,
                    i: '1955454606021394434',
                    minW: 2,
                    maxW: 7,
                    minH: 2,
                    moved: false,
                    static: false,
                },
            },
        },
        {
            widget_id: '1953450335370174465',
            data: {
                type: 'lineChart',
                name: 'Line',
                class: 'data_chart',
                icon: './icon.svg',
                defaultRow: 4,
                defaultCol: 4,
                minRow: 2,
                minCol: 2,
                configProps: [
                    {
                        components: [
                            {
                                type: 'input',
                                title: 'Title',
                                key: 'title',
                                defaultValue: 'Title',
                                componentProps: {
                                    inputProps: {
                                        maxLength: 35,
                                    },
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'chartEntityPosition',
                                title: 'entityPosition',
                                key: 'entityPosition',
                                defaultValue: '',
                                style: 'width: 100%',
                                getDataUrl: '',
                                valueType: 'array',
                                componentProps: {
                                    entityType: ['PROPERTY'],
                                    entityValueTypes: ['LONG', 'DOUBLE'],
                                    entityAccessMod: ['R', 'RW'],
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        style: 'width: 100%;',
                        components: [
                            {
                                type: 'ChartTimeSelect',
                                title: 'Time',
                                key: 'time',
                                defaultValue: 86400000,
                                style: 'width: 100%;',
                            },
                        ],
                    },
                ],
                view: [],
                iconSrc: {
                    default: '/src/plugin/plugins/line-chart/icon.svg',
                },
                config: {
                    title: 'Title test',
                    entityPosition: [
                        {
                            id: '1852267466534055948',
                            entity: {
                                value: '1852267466534055948',
                                label: 'Humidity',
                                valueType: 'DOUBLE',
                                description: 'PROPERTY',
                                rawData: {
                                    deviceName: 'AM308',
                                    integrationName: 'Milesight Development Platform',
                                    entityId: '1852267466534055948',
                                    entityAccessMod: 'R',
                                    entityKey:
                                        'msc-integration.device.DEMO_1852227367394222081.humidity',
                                    entityType: 'PROPERTY',
                                    entityName: 'Humidity',
                                    entityValueAttribute: {
                                        fractionDigits: 1,
                                        unit: '%RH',
                                        min: 0,
                                        max: 100,
                                    },
                                    entityValueType: 'DOUBLE',
                                    entityIsCustomized: false,
                                    entityCreatedAt: 1730449952161,
                                    entityUpdatedAt: 1730449952161,
                                },
                            },
                            position: 2,
                        },
                        {
                            id: '1852267466534055939',
                            entity: {
                                value: '1852267466534055939',
                                label: 'CO₂',
                                valueType: 'LONG',
                                description: 'PROPERTY',
                                rawData: {
                                    deviceName: 'AM308',
                                    integrationName: 'Milesight Development Platform',
                                    entityId: '1852267466534055939',
                                    entityAccessMod: 'R',
                                    entityKey:
                                        'msc-integration.device.DEMO_1852227367394222081.co2',
                                    entityType: 'PROPERTY',
                                    entityName: 'CO₂',
                                    entityValueAttribute: {
                                        fractionDigits: 0,
                                        unit: 'ppm',
                                        min: 0,
                                        max: 10000,
                                    },
                                    entityValueType: 'LONG',
                                    entityIsCustomized: false,
                                    entityCreatedAt: 1730449952152,
                                    entityUpdatedAt: 1730449952152,
                                },
                            },
                            position: 1,
                        },
                    ],
                    time: 86400000,
                    rightYAxisUnit: 'Humidity(%RH) new',
                    leftYAxisUnit: 'Humidity(%RH) yyy',
                },
                pos: {
                    w: 4,
                    h: 4,
                    x: 0,
                    y: 4,
                    i: '1953450335370174465',
                    minW: 2,
                    maxW: 12,
                    minH: 2,
                    moved: false,
                    static: false,
                },
            },
        },
        {
            widget_id: '1955518300207226881',
            data: {
                type: 'switch',
                name: 'Switch',
                class: 'operate',
                icon: './icon.svg',
                defaultRow: 1,
                defaultCol: 2,
                minRow: 1,
                minCol: 1,
                maxRow: 1,
                configProps: [
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'entitySelect',
                                title: 'Entity',
                                key: 'entity',
                                style: 'width: 100%',
                                getDataUrl: '',
                                componentProps: {
                                    entityType: ['SERVICE', 'PROPERTY'],
                                    entityValueTypes: ['BOOLEAN'],
                                    entityAccessMods: ['W', 'RW'],
                                    entityExcludeChildren: true,
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        components: [
                            {
                                type: 'input',
                                title: 'Label',
                                key: 'title',
                                defaultValue: 'Label',
                                componentProps: {
                                    inputProps: {
                                        maxLength: 35,
                                    },
                                },
                            },
                        ],
                    },
                    {
                        title: 'Appearance of off status',
                        style: 'display: flex;',
                        components: [
                            {
                                type: 'iconSelect',
                                key: 'offIcon',
                                style: 'flex: 1;padding-right: 12px;',
                                defaultValue: 'WifiOffIcon',
                            },
                            {
                                type: 'iconColorSelect',
                                key: 'offIconColor',
                                style: 'flex: 1;',
                                defaultValue: '#9B9B9B',
                            },
                        ],
                    },
                    {
                        title: 'Appearance of on status',
                        style: 'display: flex;margin-top:20px;',
                        components: [
                            {
                                type: 'iconSelect',
                                key: 'onIcon',
                                style: 'flex: 1;padding-right: 12px;',
                                defaultValue: 'WifiIcon',
                            },
                            {
                                type: 'iconColorSelect',
                                key: 'onIconColor',
                                style: 'flex: 1;',
                                defaultValue: '#8E66FF',
                            },
                        ],
                    },
                ],
                view: [],
                iconSrc: {
                    default: '/src/plugin/plugins/switch/icon.svg',
                },
                config: {
                    title: 'Label toilet',
                    entity: {
                        value: '1925755962447532041',
                        label: 'D2D Enable',
                        valueType: 'BOOLEAN',
                        description: 'PROPERTY, DEMO_EM500-SMTC-MEC20-RIC',
                        rawData: {
                            deviceName: 'DEMO_EM500-SMTC-MEC20-RIC',
                            integrationName: 'Milesight Development Platform',
                            entityId: '1925755962447532041',
                            entityAccessMod: 'W',
                            entityKey: 'msc-integration.device.DEMO_1925755742639063042.d2d_enable',
                            entityType: 'PROPERTY',
                            entityName: 'D2D Enable',
                            entityValueAttribute: {
                                enum: {
                                    true: 'enable',
                                    false: 'disable',
                                },
                            },
                            entityValueType: 'BOOLEAN',
                            entityIsCustomized: false,
                            entityCreatedAt: 1747970974963,
                            entityUpdatedAt: 1747970974963,
                        },
                    },
                    offAppearanceIcon: {
                        icon: 'AntCleanServiceIcon',
                        color: '#ffd147ff',
                    },
                    onAppearanceIcon: {
                        icon: 'AntFallAttentionIcon',
                        color: '#5eafffff',
                    },
                },
                pos: {
                    w: 2,
                    h: 1,
                    x: 0,
                    y: 29,
                    i: '1955518300207226881',
                    minW: 1,
                    maxW: 12,
                    minH: 1,
                    maxH: 1,
                    moved: false,
                    static: false,
                },
            },
        },
        {
            widget_id: '1955525531438981122',
            data: {
                type: 'dataCard',
                name: 'Card',
                class: 'data_card',
                icon: './icon.svg',
                defaultRow: 2,
                defaultCol: 3,
                minRow: 1,
                minCol: 2,
                configProps: [
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'entitySelect',
                                title: 'Entity',
                                key: 'entity',
                                style: 'width: 100%',
                                componentProps: {
                                    entityType: ['PROPERTY'],
                                    entityValueTypes: ['STRING', 'LONG', 'DOUBLE', 'BOOLEAN'],
                                    entityAccessMod: ['R', 'RW'],
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'input',
                                title: 'Label',
                                key: 'title',
                                style: 'width: 100%',
                                defaultValue: 'Label',
                                componentProps: {
                                    inputProps: {
                                        maxLength: 35,
                                    },
                                },
                            },
                        ],
                    },
                ],
                view: [
                    {
                        tag: 'div',
                        themes: {
                            default: {
                                class: 'data-view__container',
                            },
                        },
                        children: [
                            {
                                tag: 'span',
                                themes: {
                                    default: {
                                        class: 'data-view__content',
                                    },
                                },
                                params: ['entity'],
                            },
                        ],
                    },
                ],
                iconSrc: {
                    default: '/src/plugin/plugins/data-card/icon.svg',
                },
                config: {
                    title: 'Old Label ',
                    entity: {
                        value: '1951116579032547330',
                        label: 'Network Delay',
                        valueType: 'LONG',
                        description: 'PROPERTY, clearTest3',
                        rawData: {
                            deviceName: 'clearTest3',
                            entityId: '1951116579032547330',
                            entityAccessMod: 'R',
                            entityKey: 'ping.device.clearTest3.delay',
                            entityType: 'PROPERTY',
                            entityName: 'Network Delay',
                            entityValueAttribute: {
                                unit: 'ms',
                            },
                            entityValueType: 'LONG',
                            entityIsCustomized: false,
                            entityCreatedAt: 1754017417093,
                            entityUpdatedAt: 1754017417093,
                            deviceGroup: {
                                id: '1952175481800781825',
                                name: 'vgotest3',
                            },
                        },
                    },
                    Icon_1951116579032547330: 'AntShoppingCartFullIcon',
                    IconColor_1951116579032547330: '#93e6e1ff',
                    icons: {
                        '1951116579032547330': {
                            icon: 'AntEmergencyIcon',
                            color: '#93e6e1ff',
                        },
                    },
                },
                pos: {
                    w: 3,
                    h: 2,
                    minW: 2,
                    minH: 1,
                    y: 31,
                    x: 0,
                    i: '1955525531438981122',
                    maxW: 12,
                    moved: false,
                    static: false,
                },
            },
        },
        {
            widget_id: '1955442164118888450',
            data: {
                type: 'gaugeChart',
                name: 'Gauge',
                class: 'data_chart',
                icon: './icon.svg',
                defaultRow: 4,
                defaultCol: 4,
                minRow: 2,
                minCol: 2,
                configProps: [
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'entitySelect',
                                title: 'Entity',
                                key: 'entity',
                                style: 'width: 100%',
                                getDataUrl: '',
                                componentProps: {
                                    entityType: ['PROPERTY'],
                                    entityValueTypes: ['LONG', 'DOUBLE'],
                                    entityAccessMod: ['R', 'RW'],
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        components: [
                            {
                                type: 'input',
                                title: 'Title',
                                key: 'title',
                                style: 'width: 100%',
                                defaultValue: 'Title',
                                componentProps: {
                                    inputProps: {
                                        maxLength: 35,
                                    },
                                },
                            },
                        ],
                    },
                    {
                        style: 'width: 100%;',
                        components: [
                            {
                                type: 'ChartTimeSelect',
                                title: 'Time',
                                key: 'time',
                                style: 'width: 100%;',
                                defaultValue: 86400000,
                            },
                        ],
                    },
                    {
                        style: 'width: 100%;',
                        components: [
                            {
                                type: 'chartMetricsSelect',
                                title: 'metrics',
                                key: 'metrics',
                                style: 'width: 100%;',
                                defaultValue: 'LAST',
                                filters: ['SUM', 'COUNT'],
                            },
                        ],
                    },
                ],
                view: [
                    {
                        tag: 'div',
                        themes: {
                            default: {
                                class: 'area-chart-view',
                            },
                        },
                        children: [
                            {
                                tag: 'canvas',
                                key: 'gaugeChart',
                            },
                        ],
                    },
                ],
                iconSrc: {
                    default: '/src/plugin/plugins/gauge-chart/icon.svg',
                },
                config: {
                    title: 'Title',
                    time: 31536000000,
                    metrics: 'LAST',
                    entity: {
                        value: '1920653175522988045',
                        label: 'Distance',
                        valueType: 'LONG',
                        description: 'PROPERTY, DEMO_EM500-UDL-C100',
                        rawData: {
                            deviceName: 'DEMO_EM500-UDL-C100',
                            integrationName: 'Milesight Development Platform',
                            entityId: '1920653175522988045',
                            entityAccessMod: 'R',
                            entityKey: 'msc-integration.device.DEMO_1920653046498713602.distance',
                            entityType: 'PROPERTY',
                            entityName: 'Distance',
                            entityValueAttribute: {
                                unit: 'mm',
                                min: 250,
                                max: 8000,
                            },
                            entityValueType: 'LONG',
                            entityIsCustomized: false,
                            entityCreatedAt: 1746754375759,
                            entityUpdatedAt: 1747033755938,
                        },
                    },
                },
                pos: {
                    w: 4,
                    h: 4,
                    x: 5,
                    y: 12,
                    i: '1955442164118888450',
                    minW: 2,
                    maxW: 7,
                    minH: 2,
                    moved: false,
                    static: false,
                },
            },
        },
        {
            widget_id: '1953757200621858818',
            data: {
                type: 'dataCard',
                name: 'Card',
                class: 'data_card',
                icon: './icon.svg',
                defaultRow: 2,
                defaultCol: 3,
                minRow: 1,
                minCol: 2,
                configProps: [
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'entitySelect',
                                title: 'Entity',
                                key: 'entity',
                                style: 'width: 100%',
                                componentProps: {
                                    entityType: ['PROPERTY'],
                                    entityValueTypes: ['STRING', 'LONG', 'DOUBLE', 'BOOLEAN'],
                                    entityAccessMod: ['R', 'RW'],
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'input',
                                title: 'Label',
                                key: 'title',
                                style: 'width: 100%',
                                defaultValue: 'Label',
                                componentProps: {
                                    inputProps: {
                                        maxLength: 35,
                                    },
                                },
                            },
                        ],
                    },
                ],
                view: [
                    {
                        tag: 'div',
                        themes: {
                            default: {
                                class: 'data-view__container',
                            },
                        },
                        children: [
                            {
                                tag: 'span',
                                themes: {
                                    default: {
                                        class: 'data-view__content',
                                    },
                                },
                                params: ['entity'],
                            },
                        ],
                    },
                ],
                iconSrc: {
                    default: '/src/plugin/plugins/data-card/icon.svg',
                },
                config: {
                    title: 'Label111',
                    entity: {
                        value: '1891820394655490310',
                        label: 'Sat.',
                        valueType: 'BOOLEAN',
                        description: 'PROPERTY, DEMO_WT201, Wake Event - 7',
                        rawData: {
                            deviceName: 'DEMO_WT201',
                            integrationName: 'Milesight Development Platform',
                            entityId: '1891820394655490310',
                            entityAccessMod: 'RW',
                            entityKey:
                                'msc-integration.device.DEMO_1891820269603987458.wake_schedule_settings[7].plan_loop_week_6',
                            entityType: 'PROPERTY',
                            entityName: 'Sat.',
                            entityParentName: 'Wake Event - 7',
                            entityValueAttribute: {
                                enum: {
                                    true: 'enable',
                                    false: 'disable',
                                },
                            },
                            entityValueType: 'BOOLEAN',
                            entityIsCustomized: false,
                            entityCreatedAt: 1739880110598,
                            entityUpdatedAt: 1739880110598,
                        },
                    },
                    Icon_0: 'AddCircleOutlineIcon',
                    IconColor_0: '#40c776ff',
                    Icon_1: 'AntFemaleIcon',
                    IconColor_1: '#ff6661ff',
                    Icon_true: 'AccountCircleIcon',
                    IconColor_true: '#ffd147ff',
                    Icon_false: 'AntPm10Icon',
                    IconColor_false: '#5eafffff',
                },
                pos: {
                    w: 3,
                    h: 2,
                    x: 0,
                    y: 16,
                    i: '1953757200621858818',
                    minW: 2,
                    maxW: 12,
                    minH: 1,
                    moved: false,
                    static: false,
                },
            },
        },
        {
            widget_id: '1955135705939374082',
            data: {
                type: 'dataCard',
                name: 'Card',
                class: 'data_card',
                icon: './icon.svg',
                defaultRow: 2,
                defaultCol: 3,
                minRow: 1,
                minCol: 2,
                configProps: [
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'entitySelect',
                                title: 'Entity',
                                key: 'entity',
                                style: 'width: 100%',
                                componentProps: {
                                    entityType: ['PROPERTY'],
                                    entityValueTypes: ['STRING', 'LONG', 'DOUBLE', 'BOOLEAN'],
                                    entityAccessMod: ['R', 'RW'],
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'input',
                                title: 'Label',
                                key: 'title',
                                style: 'width: 100%',
                                defaultValue: 'Label',
                                componentProps: {
                                    inputProps: {
                                        maxLength: 35,
                                    },
                                },
                            },
                        ],
                    },
                ],
                view: [
                    {
                        tag: 'div',
                        themes: {
                            default: {
                                class: 'data-view__container',
                            },
                        },
                        children: [
                            {
                                tag: 'span',
                                themes: {
                                    default: {
                                        class: 'data-view__content',
                                    },
                                },
                                params: ['entity'],
                            },
                        ],
                    },
                ],
                iconSrc: {
                    default: '/src/plugin/plugins/data-card/icon.svg',
                },
                config: {
                    entity: {
                        value: '1920653175522988045',
                        label: 'Distance',
                        valueType: 'LONG',
                        description: 'PROPERTY, DEMO_EM500-UDL-C100',
                        rawData: {
                            deviceName: 'DEMO_EM500-UDL-C100',
                            integrationName: 'Milesight Development Platform',
                            entityId: '1920653175522988045',
                            entityAccessMod: 'R',
                            entityKey: 'msc-integration.device.DEMO_1920653046498713602.distance',
                            entityType: 'PROPERTY',
                            entityName: 'Distance',
                            entityValueAttribute: {
                                unit: 'mm',
                                min: 250,
                                max: 8000,
                            },
                            entityValueType: 'LONG',
                            entityIsCustomized: false,
                            entityCreatedAt: 1746754375759,
                            entityUpdatedAt: 1747033755938,
                        },
                    },
                    title: 'Title-mm',
                    icons: {
                        '1920653175522988045': {
                            icon: 'AntAirQualityIcon',
                            color: '#8e66ffff',
                        },
                    },
                },
                pos: {
                    w: 3,
                    h: 2,
                    x: 0,
                    y: 20,
                    i: '1955135705939374082',
                    minW: 2,
                    maxW: 12,
                    minH: 1,
                    moved: false,
                    static: false,
                },
            },
        },
        {
            widget_id: '1955496854578692097',
            data: {
                type: 'pieChart',
                name: 'Pie',
                class: 'data_chart',
                icon: './icon.svg',
                defaultRow: 4,
                defaultCol: 4,
                minRow: 2,
                minCol: 2,
                configProps: [
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'entitySelect',
                                title: 'Entity',
                                key: 'entity',
                                style: 'width: 100%',
                                getDataUrl: '',
                                componentProps: {
                                    entityType: ['PROPERTY'],
                                    entityValueTypes: ['BOOLEAN', 'STRING'],
                                    entityAccessMod: ['R', 'RW'],
                                    customFilterEntity: 'filterEntityStringHasEnum',
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        components: [
                            {
                                type: 'input',
                                title: 'Title',
                                key: 'title',
                                style: 'width: 100%',
                                defaultValue: 'Title',
                                componentProps: {
                                    inputProps: {
                                        maxLength: 35,
                                    },
                                },
                            },
                        ],
                    },
                    {
                        style: 'width: 100%;',
                        components: [
                            {
                                type: 'ChartTimeSelect',
                                title: 'Time',
                                key: 'time',
                                style: 'width: 100%;',
                                defaultValue: 86400000,
                            },
                        ],
                    },
                    {
                        style: 'width: 100%;',
                        components: [
                            {
                                type: 'chartMetricsSelect',
                                title: 'metrics',
                                key: 'metrics',
                                style: 'width: 100%;',
                                defaultValue: 'COUNT',
                                filters: ['LAST', 'MIN', 'MAX', 'AVG', 'SUM'],
                            },
                        ],
                    },
                ],
                view: [],
                iconSrc: {
                    default: '/src/plugin/plugins/pie-chart/icon.svg',
                },
                config: {
                    title: 'Title pie',
                    time: 31536000000,
                    metrics: 'COUNT',
                    entity: {
                        value: '1852267466534055940',
                        label: 'Buzzer Status',
                        valueType: 'STRING',
                        description: 'PROPERTY',
                        rawData: {
                            deviceName: 'AM308',
                            integrationName: 'Milesight Development Platform',
                            entityId: '1852267466534055940',
                            entityAccessMod: 'R',
                            entityKey:
                                'msc-integration.device.DEMO_1852227367394222081.buzzer_status',
                            entityType: 'PROPERTY',
                            entityName: 'Buzzer Status',
                            entityValueAttribute: {
                                enum: {
                                    '0': 'normal',
                                    '1': 'alarm',
                                },
                            },
                            entityValueType: 'STRING',
                            entityIsCustomized: false,
                            entityCreatedAt: 1730449952153,
                            entityUpdatedAt: 1730449952153,
                        },
                    },
                },
                pos: {
                    w: 4,
                    h: 4,
                    x: 5,
                    y: 20,
                    i: '1955496854578692097',
                    minW: 2,
                    maxW: 7,
                    minH: 2,
                    moved: false,
                    static: false,
                },
            },
        },
        {
            widget_id: '1954878585759121410',
            data: {
                type: 'dataCard',
                name: 'Card',
                class: 'data_card',
                icon: './icon.svg',
                defaultRow: 2,
                defaultCol: 3,
                minRow: 1,
                minCol: 2,
                configProps: [
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'entitySelect',
                                title: 'Entity',
                                key: 'entity',
                                style: 'width: 100%',
                                componentProps: {
                                    entityType: ['PROPERTY'],
                                    entityValueTypes: ['STRING', 'LONG', 'DOUBLE', 'BOOLEAN'],
                                    entityAccessMod: ['R', 'RW'],
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'input',
                                title: 'Label',
                                key: 'title',
                                style: 'width: 100%',
                                defaultValue: 'Label',
                                componentProps: {
                                    inputProps: {
                                        maxLength: 35,
                                    },
                                },
                            },
                        ],
                    },
                ],
                view: [
                    {
                        tag: 'div',
                        themes: {
                            default: {
                                class: 'data-view__container',
                            },
                        },
                        children: [
                            {
                                tag: 'span',
                                themes: {
                                    default: {
                                        class: 'data-view__content',
                                    },
                                },
                                params: ['entity'],
                            },
                        ],
                    },
                ],
                iconSrc: {
                    default: '/src/plugin/plugins/data-card/icon.svg',
                },
                config: {
                    title: 'Label',
                    entity: {
                        value: '1951116579032547330',
                        label: 'Network Delay',
                        valueType: 'LONG',
                        description: 'PROPERTY, clearTest3',
                        rawData: {
                            deviceName: 'clearTest3',
                            integrationName: 'Ping',
                            entityId: '1951116579032547330',
                            entityAccessMod: 'R',
                            entityKey: 'ping.device.clearTest3.delay',
                            entityType: 'PROPERTY',
                            entityName: 'Network Delay',
                            entityValueAttribute: {
                                unit: 'ms',
                            },
                            entityValueType: 'LONG',
                            entityIsCustomized: false,
                            entityCreatedAt: 1754017417093,
                            entityUpdatedAt: 1754017417093,
                            deviceGroup: {
                                id: '1952175481800781825',
                                name: 'vgotest3',
                            },
                        },
                    },
                    Icon_1951116579032547330: 'AntFallAttentionIcon',
                    IconColor_1951116579032547330: '#ff975eff',
                    icons: {
                        '1951116579032547330': {
                            icon: 'AntFallAttentionIcon',
                            color: '#5eafffff',
                        },
                    },
                },
                pos: {
                    w: 3,
                    h: 2,
                    x: 0,
                    y: 18,
                    i: '1954878585759121410',
                    minW: 2,
                    maxW: 12,
                    minH: 1,
                    moved: false,
                    static: false,
                },
            },
        },
        {
            widget_id: '1955146291292979201',
            data: {
                type: 'dataCard',
                name: 'Card',
                class: 'data_card',
                icon: './icon.svg',
                defaultRow: 2,
                defaultCol: 3,
                minRow: 1,
                minCol: 2,
                configProps: [
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'entitySelect',
                                title: 'Entity',
                                key: 'entity',
                                style: 'width: 100%',
                                componentProps: {
                                    entityType: ['PROPERTY'],
                                    entityValueTypes: ['STRING', 'LONG', 'DOUBLE', 'BOOLEAN'],
                                    entityAccessMod: ['R', 'RW'],
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'input',
                                title: 'Label',
                                key: 'title',
                                style: 'width: 100%',
                                defaultValue: 'Label',
                                componentProps: {
                                    inputProps: {
                                        maxLength: 35,
                                    },
                                },
                            },
                        ],
                    },
                ],
                view: [
                    {
                        tag: 'div',
                        themes: {
                            default: {
                                class: 'data-view__container',
                            },
                        },
                        children: [
                            {
                                tag: 'span',
                                themes: {
                                    default: {
                                        class: 'data-view__content',
                                    },
                                },
                                params: ['entity'],
                            },
                        ],
                    },
                ],
                iconSrc: {
                    default: '/src/plugin/plugins/data-card/icon.svg',
                },
                config: {
                    entity: {
                        value: '1951116579032547329',
                        label: 'Device Status',
                        valueType: 'LONG',
                        description: 'PROPERTY, clearTest3',
                        rawData: {
                            deviceName: 'clearTest3',
                            integrationName: 'Ping',
                            entityId: '1951116579032547329',
                            entityAccessMod: 'R',
                            entityKey: 'ping.device.clearTest3.status',
                            entityType: 'PROPERTY',
                            entityName: 'Device Status',
                            entityValueAttribute: {
                                enum: {
                                    '0': 'ONLINE',
                                    '1': 'OFFLINE',
                                },
                            },
                            entityValueType: 'LONG',
                            entityIsCustomized: false,
                            entityCreatedAt: 1754017417093,
                            entityUpdatedAt: 1754017417093,
                            deviceGroup: {
                                id: '1952175481800781825',
                                name: 'vgotest3',
                            },
                        },
                    },
                    title: 'Title-Status',
                    icons: {
                        '0': {
                            icon: 'AntChildIcon',
                            color: '#5eafffff',
                        },
                        '1': {
                            icon: 'AntAirConditionerIcon',
                            color: '#ffd147ff',
                        },
                    },
                },
                pos: {
                    w: 3,
                    h: 2,
                    x: 0,
                    y: 22,
                    i: '1955146291292979201',
                    minW: 2,
                    maxW: 12,
                    minH: 1,
                    moved: false,
                    static: false,
                },
            },
        },
        {
            widget_id: '1952615751136083970',
            data: {
                type: 'switch',
                name: 'Switch',
                class: 'operate',
                icon: './icon.svg',
                defaultRow: 1,
                defaultCol: 2,
                minRow: 1,
                minCol: 1,
                maxRow: 1,
                configProps: [
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'entitySelect',
                                title: 'Entity',
                                key: 'entity',
                                style: 'width: 100%',
                                getDataUrl: '',
                                componentProps: {
                                    entityType: ['SERVICE', 'PROPERTY'],
                                    entityValueTypes: ['BOOLEAN'],
                                    entityAccessMods: ['W', 'RW'],
                                    entityExcludeChildren: true,
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        components: [
                            {
                                type: 'input',
                                title: 'Label',
                                key: 'title',
                                defaultValue: 'Label',
                                componentProps: {
                                    inputProps: {
                                        maxLength: 35,
                                    },
                                },
                            },
                        ],
                    },
                    {
                        title: 'Appearance of off status',
                        style: 'display: flex;',
                        components: [
                            {
                                type: 'iconSelect',
                                key: 'offIcon',
                                style: 'flex: 1;padding-right: 12px;',
                                defaultValue: 'WifiOffIcon',
                            },
                            {
                                type: 'iconColorSelect',
                                key: 'offIconColor',
                                style: 'flex: 1;',
                                defaultValue: '#9B9B9B',
                            },
                        ],
                    },
                    {
                        title: 'Appearance of on status',
                        style: 'display: flex;margin-top:20px;',
                        components: [
                            {
                                type: 'iconSelect',
                                key: 'onIcon',
                                style: 'flex: 1;padding-right: 12px;',
                                defaultValue: 'WifiIcon',
                            },
                            {
                                type: 'iconColorSelect',
                                key: 'onIconColor',
                                style: 'flex: 1;',
                                defaultValue: '#8E66FF',
                            },
                        ],
                    },
                ],
                view: [],
                iconSrc: {
                    default: '/src/plugin/plugins/switch/icon.svg',
                },
                config: {
                    title: 'Hello Screen',
                    offIcon: 'AntStaffIcon',
                    offIconColor: '#8e66ffff',
                    onIcon: 'AntFemaleIcon',
                    onIconColor: '#5eafffff',
                    entity: {
                        value: '1947551984156905493',
                        label: 'Screen Display',
                        valueType: 'BOOLEAN',
                        description: 'PROPERTY, AM102',
                        rawData: {
                            deviceName: 'AM102',
                            integrationName: 'Milesight Development Platform',
                            entityId: '1947551984156905493',
                            entityAccessMod: 'W',
                            entityKey: 'msc-integration.device.6725060D00480036.screen_enable',
                            entityType: 'PROPERTY',
                            entityName: 'Screen Display',
                            entityValueAttribute: {
                                enum: {
                                    true: 'enable',
                                    false: 'disable',
                                },
                            },
                            entityValueType: 'BOOLEAN',
                            entityIsCustomized: false,
                            entityCreatedAt: 1753167551466,
                            entityUpdatedAt: 1753167551466,
                        },
                    },
                    offAppearanceIcon: {
                        icon: 'AntChildIcon',
                        color: '#ff6661ff',
                    },
                },
                pos: {
                    w: 2,
                    h: 1,
                    x: 9,
                    y: 0,
                    i: '1952615751136083970',
                    minW: 1,
                    maxW: 3,
                    minH: 1,
                    maxH: 1,
                    moved: false,
                    static: false,
                },
            },
        },
        {
            widget_id: '1955521304360689666',
            data: {
                type: 'switch',
                name: 'Switch',
                class: 'operate',
                icon: './icon.svg',
                defaultRow: 1,
                defaultCol: 2,
                minRow: 1,
                minCol: 1,
                maxRow: 1,
                configProps: [
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'entitySelect',
                                title: 'Entity',
                                key: 'entity',
                                style: 'width: 100%',
                                getDataUrl: '',
                                componentProps: {
                                    entityType: ['SERVICE', 'PROPERTY'],
                                    entityValueTypes: ['BOOLEAN'],
                                    entityAccessMods: ['W', 'RW'],
                                    entityExcludeChildren: true,
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        components: [
                            {
                                type: 'input',
                                title: 'Label',
                                key: 'title',
                                defaultValue: 'Label',
                                componentProps: {
                                    inputProps: {
                                        maxLength: 35,
                                    },
                                },
                            },
                        ],
                    },
                    {
                        title: 'Appearance of off status',
                        style: 'display: flex;',
                        components: [
                            {
                                type: 'iconSelect',
                                key: 'offIcon',
                                style: 'flex: 1;padding-right: 12px;',
                                defaultValue: 'WifiOffIcon',
                            },
                            {
                                type: 'iconColorSelect',
                                key: 'offIconColor',
                                style: 'flex: 1;',
                                defaultValue: '#9B9B9B',
                            },
                        ],
                    },
                    {
                        title: 'Appearance of on status',
                        style: 'display: flex;margin-top:20px;',
                        components: [
                            {
                                type: 'iconSelect',
                                key: 'onIcon',
                                style: 'flex: 1;padding-right: 12px;',
                                defaultValue: 'WifiIcon',
                            },
                            {
                                type: 'iconColorSelect',
                                key: 'onIconColor',
                                style: 'flex: 1;',
                                defaultValue: '#8E66FF',
                            },
                        ],
                    },
                ],
                view: [],
                iconSrc: {
                    default: '/src/plugin/plugins/switch/icon.svg',
                },
                config: {
                    title: 'Label fine',
                    entity: {
                        value: '1948213176818868246',
                        label: 'Screen Intelligent',
                        valueType: 'BOOLEAN',
                        description: 'PROPERTY, simon-test-device',
                        rawData: {
                            deviceName: 'simon-test-device',
                            integrationName: 'Milesight Development Platform',
                            entityId: '1948213176818868246',
                            entityAccessMod: 'W',
                            entityKey: 'msc-integration.device.6725060FA9EE0039.screen_intelligent',
                            entityType: 'PROPERTY',
                            entityName: 'Screen Intelligent',
                            entityValueAttribute: {
                                enum: {
                                    true: 'enable',
                                    false: 'disable',
                                },
                            },
                            entityValueType: 'BOOLEAN',
                            entityIsCustomized: false,
                            entityCreatedAt: 1753325192075,
                            entityUpdatedAt: 1753325192075,
                            deviceGroup: {
                                id: '1950396671595159554',
                                name: 'cedd',
                            },
                        },
                    },
                },
                pos: {
                    w: 2,
                    h: 1,
                    x: 0,
                    y: 30,
                    i: '1955521304360689666',
                    minW: 1,
                    maxW: 12,
                    minH: 1,
                    maxH: 1,
                    moved: false,
                    static: false,
                },
            },
        },
        {
            widget_id: '1955253273557368833',
            data: {
                type: 'areaChart',
                name: 'Area',
                class: 'data_chart',
                icon: './icon.svg',
                defaultRow: 4,
                defaultCol: 4,
                minRow: 2,
                minCol: 2,
                configProps: [
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'multiEntitySelect',
                                title: 'Entity',
                                key: 'entity',
                                style: 'width: 100%',
                                getDataUrl: '',
                                valueType: 'array',
                                componentProps: {
                                    entityType: ['PROPERTY'],
                                    entityValueTypes: ['LONG', 'DOUBLE'],
                                    entityAccessMod: ['R', 'RW'],
                                },
                                rules: {
                                    required: true,
                                },
                            },
                        ],
                    },
                    {
                        components: [
                            {
                                type: 'input',
                                title: 'Title',
                                key: 'title',
                                defaultValue: 'Title',
                                componentProps: {
                                    inputProps: {
                                        maxLength: 35,
                                    },
                                },
                            },
                        ],
                    },
                    {
                        style: 'width: 100%;',
                        components: [
                            {
                                type: 'ChartTimeSelect',
                                title: 'Time',
                                key: 'time',
                                style: 'width: 100%;',
                                defaultValue: 86400000,
                            },
                        ],
                    },
                ],
                view: [],
                iconSrc: {
                    default: '/src/plugin/plugins/area-chart/icon.svg',
                },
                config: {
                    title: 'Title area done',
                    time: 31536000000,
                    entity: [
                        {
                            value: '1852267466534055954',
                            label: 'PM10',
                            valueType: 'LONG',
                            description: 'PROPERTY, AM308',
                            rawData: {
                                deviceName: 'AM308',
                                integrationName: 'Milesight Development Platform',
                                entityId: '1852267466534055954',
                                entityAccessMod: 'R',
                                entityKey: 'msc-integration.device.DEMO_1852227367394222081.pm10',
                                entityType: 'PROPERTY',
                                entityName: 'PM10',
                                entityValueAttribute: {
                                    unit: 'ug/m3',
                                },
                                entityValueType: 'LONG',
                                entityIsCustomized: false,
                                entityCreatedAt: 1730449952166,
                                entityUpdatedAt: 1730449952166,
                            },
                        },
                        {
                            value: '1852267466534055946',
                            label: 'PM2.5',
                            valueType: 'LONG',
                            description: 'PROPERTY, AM308',
                            rawData: {
                                deviceName: 'AM308',
                                integrationName: 'Milesight Development Platform',
                                entityId: '1852267466534055946',
                                entityAccessMod: 'R',
                                entityKey: 'msc-integration.device.DEMO_1852227367394222081.pm2_5',
                                entityType: 'PROPERTY',
                                entityName: 'PM2.5',
                                entityValueAttribute: {
                                    unit: 'ug/m3',
                                },
                                entityValueType: 'LONG',
                                entityIsCustomized: false,
                                entityCreatedAt: 1730449952159,
                                entityUpdatedAt: 1730449952159,
                            },
                        },
                        {
                            value: '1852267466534055939',
                            label: 'CO₂',
                            valueType: 'LONG',
                            description: 'PROPERTY',
                            rawData: {
                                deviceName: 'AM308',
                                integrationName: 'Milesight Development Platform',
                                entityId: '1852267466534055939',
                                entityAccessMod: 'R',
                                entityKey: 'msc-integration.device.DEMO_1852227367394222081.co2',
                                entityType: 'PROPERTY',
                                entityName: 'CO₂',
                                entityValueAttribute: {
                                    fractionDigits: 0,
                                    unit: 'ppm',
                                    min: 0,
                                    max: 10000,
                                },
                                entityValueType: 'LONG',
                                entityIsCustomized: false,
                                entityCreatedAt: 1730449952152,
                                entityUpdatedAt: 1730449952152,
                            },
                        },
                    ],
                },
                pos: {
                    w: 4,
                    h: 4,
                    x: 5,
                    y: 4,
                    i: '1955253273557368833',
                    minW: 2,
                    maxW: 7,
                    minH: 2,
                    moved: false,
                    static: false,
                },
            },
        },
        {
            widget_id: '1952618645251981314',
            data: {
                type: 'image',
                name: 'Image',
                class: 'data_card',
                icon: './icon.svg',
                defaultRow: 2,
                defaultCol: 3,
                minRow: 1,
                minCol: 2,
                configProps: [
                    {
                        style: 'width: 100%',
                        components: [
                            {
                                type: 'input',
                                title: 'Label',
                                key: 'label',
                                style: 'width: 100%',
                                defaultValue: 'Title',
                                componentProps: {
                                    inputProps: {
                                        maxLength: 35,
                                    },
                                },
                            },
                        ],
                    },
                ],
                view: [],
                iconSrc: {
                    default: '/src/plugin/plugins/image/icon.svg',
                },
                config: {
                    label: 'Small Fox 666',
                    dataType: 'url',
                    url: 'https://fuss10.elemecdn.com/3/28/bbf893f792f03a54408b3b7a7ebf0jpeg.jpeg',
                    file: {
                        name: 'b143a5436a5b5b09.jpg',
                        size: 104209,
                        path: './b143a5436a5b5b09.jpg',
                        key: 'beaver-iot-public/fb6ab913-f6da-49ff-a68d-d29830f93e36-b143a5436a5b5b09.jpg',
                        url: 'http://192.168.43.48:9000/beaver-iot-resource/beaver-iot-public/fb6ab913-f6da-49ff-a68d-d29830f93e36-b143a5436a5b5b09.jpg',
                    },
                },
                pos: {
                    w: 3,
                    h: 2,
                    x: 9,
                    y: 1,
                    i: '1952618645251981314',
                    minW: 2,
                    maxW: 3,
                    minH: 1,
                    moved: false,
                    static: false,
                },
            },
        },
    ],
    entity_ids: [
        '1920653175522988045',
        '1925755962447532041',
        '1951116579032547330',
        '1891820394655490310',
        '1852267466534055940',
        '1951116579032547329',
        '1947551984156905493',
        '1948213176818868246',
        '1852267466534055948',
        '1852267466534055939',
        '1852267466534055954',
        '1905158947900743721',
        '1852267466534055947',
        '1852267466534055946',
    ],
    entities: [
        {
            device_name: 'AM308',
            integration_name: 'Milesight Development Platform',
            entity_id: '1852267466534055939',
            entity_access_mod: 'R',
            entity_key: 'msc-integration.device.DEMO_1852227367394222081.co2',
            entity_type: 'PROPERTY',
            entity_name: 'CO₂',
            entity_value_attribute: {
                fraction_digits: 0,
                unit: 'ppm',
                min: 0,
                max: 10000,
            },
            entity_value_type: 'LONG',
            entity_is_customized: false,
            entity_created_at: 1730449952152,
            entity_updated_at: 1730449952152,
        },
        {
            device_name: 'AM308',
            integration_name: 'Milesight Development Platform',
            entity_id: '1852267466534055940',
            entity_access_mod: 'R',
            entity_key: 'msc-integration.device.DEMO_1852227367394222081.buzzer_status',
            entity_type: 'PROPERTY',
            entity_name: 'Buzzer Status',
            entity_value_attribute: {
                enum: {
                    '0': 'normal',
                    '1': 'alarm',
                },
            },
            entity_value_type: 'STRING',
            entity_is_customized: false,
            entity_created_at: 1730449952153,
            entity_updated_at: 1730449952153,
        },
        {
            device_name: 'AM308',
            integration_name: 'Milesight Development Platform',
            entity_id: '1852267466534055946',
            entity_access_mod: 'R',
            entity_key: 'msc-integration.device.DEMO_1852227367394222081.pm2_5',
            entity_type: 'PROPERTY',
            entity_name: 'PM2.5',
            entity_value_attribute: {
                unit: 'ug/m3',
            },
            entity_value_type: 'LONG',
            entity_is_customized: false,
            entity_created_at: 1730449952159,
            entity_updated_at: 1730449952159,
        },
        {
            device_name: 'AM308',
            integration_name: 'Milesight Development Platform',
            entity_id: '1852267466534055947',
            entity_access_mod: 'R',
            entity_key: 'msc-integration.device.DEMO_1852227367394222081.temperature',
            entity_type: 'PROPERTY',
            entity_name: 'Temperature',
            entity_value_attribute: {
                fraction_digits: 1,
                unit: '°C',
                min: -20,
                max: 60,
            },
            entity_value_type: 'DOUBLE',
            entity_is_customized: false,
            entity_created_at: 1730449952160,
            entity_updated_at: 1730449952160,
        },
        {
            device_name: 'AM308',
            integration_name: 'Milesight Development Platform',
            entity_id: '1852267466534055948',
            entity_access_mod: 'R',
            entity_key: 'msc-integration.device.DEMO_1852227367394222081.humidity',
            entity_type: 'PROPERTY',
            entity_name: 'Humidity',
            entity_value_attribute: {
                fraction_digits: 1,
                unit: '%RH',
                min: 0,
                max: 100,
            },
            entity_value_type: 'DOUBLE',
            entity_is_customized: false,
            entity_created_at: 1730449952161,
            entity_updated_at: 1730449952161,
        },
        {
            device_name: 'AM308',
            integration_name: 'Milesight Development Platform',
            entity_id: '1852267466534055954',
            entity_access_mod: 'R',
            entity_key: 'msc-integration.device.DEMO_1852227367394222081.pm10',
            entity_type: 'PROPERTY',
            entity_name: 'PM10',
            entity_value_attribute: {
                unit: 'ug/m3',
            },
            entity_value_type: 'LONG',
            entity_is_customized: false,
            entity_created_at: 1730449952166,
            entity_updated_at: 1730449952166,
        },
        {
            device_name: 'DEMO_WT201',
            integration_name: 'Milesight Development Platform',
            entity_id: '1891820394655490310',
            entity_access_mod: 'RW',
            entity_key:
                'msc-integration.device.DEMO_1891820269603987458.wake_schedule_settings[7].plan_loop_week_6',
            entity_type: 'PROPERTY',
            entity_name: 'Sat.',
            entity_parent_name: 'Wake Event - 7',
            entity_value_attribute: {
                enum: {
                    true: 'enable',
                    false: 'disable',
                },
            },
            entity_value_type: 'BOOLEAN',
            entity_is_customized: false,
            entity_created_at: 1739880110598,
            entity_updated_at: 1739880110598,
        },
        {
            device_name: 'DEMO_AM308L',
            integration_name: 'Milesight Development Platform',
            entity_id: '1905158947900743721',
            entity_access_mod: 'R',
            entity_key: 'msc-integration.device.DEMO_1905158671063425025.temperature',
            entity_type: 'PROPERTY',
            entity_name: 'Temperature',
            entity_value_attribute: {
                fraction_digits: 1,
                unit: '°C',
                min: -20,
                max: 60,
            },
            entity_value_type: 'DOUBLE',
            entity_is_customized: false,
            entity_created_at: 1743060264168,
            entity_updated_at: 1743060264168,
        },
        {
            device_name: 'DEMO_EM500-UDL-C100',
            integration_name: 'Milesight Development Platform',
            entity_id: '1920653175522988045',
            entity_access_mod: 'R',
            entity_key: 'msc-integration.device.DEMO_1920653046498713602.distance',
            entity_type: 'PROPERTY',
            entity_name: 'Distance',
            entity_value_attribute: {
                unit: 'mm',
                min: 250,
                max: 8000,
            },
            entity_value_type: 'LONG',
            entity_is_customized: false,
            entity_created_at: 1746754375759,
            entity_updated_at: 1747033755938,
        },
        {
            device_name: 'DEMO_EM500-SMTC-MEC20-RIC',
            integration_name: 'Milesight Development Platform',
            entity_id: '1925755962447532041',
            entity_access_mod: 'W',
            entity_key: 'msc-integration.device.DEMO_1925755742639063042.d2d_enable',
            entity_type: 'PROPERTY',
            entity_name: 'D2D Enable',
            entity_value_attribute: {
                enum: {
                    true: 'enable',
                    false: 'disable',
                },
            },
            entity_value_type: 'BOOLEAN',
            entity_is_customized: false,
            entity_created_at: 1747970974963,
            entity_updated_at: 1747970974963,
        },
        {
            device_name: 'AM102',
            integration_name: 'Milesight Development Platform',
            entity_id: '1947551984156905493',
            entity_access_mod: 'W',
            entity_key: 'msc-integration.device.6725060D00480036.screen_enable',
            entity_type: 'PROPERTY',
            entity_name: 'Screen Display',
            entity_value_attribute: {
                enum: {
                    true: 'enable',
                    false: 'disable',
                },
            },
            entity_value_type: 'BOOLEAN',
            entity_is_customized: false,
            entity_created_at: 1753167551466,
            entity_updated_at: 1753167551466,
        },
        {
            device_name: 'simon-test-device',
            integration_name: 'Milesight Development Platform',
            entity_id: '1948213176818868246',
            entity_access_mod: 'W',
            entity_key: 'msc-integration.device.6725060FA9EE0039.screen_intelligent',
            entity_type: 'PROPERTY',
            entity_name: 'Screen Intelligent',
            entity_value_attribute: {
                enum: {
                    true: 'enable',
                    false: 'disable',
                },
            },
            entity_value_type: 'BOOLEAN',
            entity_is_customized: false,
            entity_created_at: 1753325192075,
            entity_updated_at: 1753325192075,
            device_group: {
                id: '1950396671595159554',
                name: 'cedd',
            },
        },
        {
            device_name: 'clearTest3',
            entity_id: '1951116579032547329',
            entity_access_mod: 'R',
            entity_key: 'ping.device.clearTest3.status',
            entity_type: 'PROPERTY',
            entity_name: 'Device Status',
            entity_value_attribute: {
                enum: {
                    '0': 'ONLINE',
                    '1': 'OFFLINE',
                },
            },
            entity_value_type: 'LONG',
            entity_is_customized: false,
            entity_created_at: 1754017417093,
            entity_updated_at: 1754017417093,
            device_group: {
                id: '1952175481800781825',
                name: 'vgotest3',
            },
        },
        {
            device_name: 'clearTest3',
            entity_id: '1951116579032547330',
            entity_access_mod: 'R',
            entity_key: 'ping.device.clearTest3.delay',
            entity_type: 'PROPERTY',
            entity_name: 'Network Delay',
            entity_value_attribute: {
                unit: 'ms',
            },
            entity_value_type: 'LONG',
            entity_is_customized: false,
            entity_created_at: 1754017417093,
            entity_updated_at: 1754017417093,
            device_group: {
                id: '1952175481800781825',
                name: 'vgotest3',
            },
        },
    ],
};

export default data;
