declare type AddDashboardType = {
    name: string;
    id?: ApiKey;
};

declare type AddWidget = {
    type: string;
};

declare type WidgetType = CustomComponentProps & {
    pos: PosType;
    config: any;
};

declare type PosType = {
    width: number;
    height: number;
    initWidth: number;
    initHeight: number;
    parentWidth: number;
    parentHeight: number;
    left: number;
    top: number;
};
