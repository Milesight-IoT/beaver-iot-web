import React, { ReactElement, JSXElementConstructor } from 'react';
import { createSvgIcon } from '@mui/material/utils';
import { loadSvgSource } from '../helper';
import svgSource from './source';

loadSvgSource(svgSource);

const CustomCreateSvgIcon = (
    svg: ReactElement<any, string | JSXElementConstructor<any>>,
    displayName: string,
) => {
    const Component = (props: Record<string, any>) => {
        const { className, ...otherProps } = props;
        return React.cloneElement(svg, {
            className: `${svg.props.className} ${className || ''}`,
            ...otherProps,
        });
    };
    Component.displayName = displayName;
    return createSvgIcon(<Component />, displayName);
};

export const IotLocationIcon = createSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#location" />
    </svg>,
    'LocationIcon',
);

export const IotCustomizeIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#customize" />
    </svg>,
    'CustomizeIcon',
);

export const IotFanModeAutoIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#fan-mode-auto" />
    </svg>,
    'FanModeAutoIcon',
);

export const IotFanModeContinuousIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#fan-mode-continuous" />
    </svg>,
    'FanModeContinuousIcon',
);

export const IotFanModeRecirculationIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#fan-mode-recirculation" />
    </svg>,
    'FanModeRecirculationIcon',
);

export const IotFanModeDisabledIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#fan-mode-disabled" />
    </svg>,
    'FanModeDisabledIcon',
);

export const IotSolenoidValveOpenIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#solenoid-valve-open" />
    </svg>,
    'SolenoidValveOpenIcon',
);

export const IotEvalZeroIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#eval-0" />
    </svg>,
    'EvalZeroIcon',
);

export const IotSwitchOffIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#switch-off" />
    </svg>,
    'SwitchOffIcon',
);

export const IotSwitchOnIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#switch-on" />
    </svg>,
    'SwitchOnIcon',
);

export const IotCurrentOverflowNormalIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#current-overflow-normal" />
    </svg>,
    'CurrentOverflowNormalIcon',
);

export const IotChnIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#chn" />
    </svg>,
    'ChnIcon',
);

export const IotRainFallIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#rainfall" />
    </svg>,
    'RainFallIcon',
);

export const IotCurrentOverflowAlarmIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#current-overflow-alarm" />
    </svg>,
    'CurrentOverflowAlarmIcon',
);

export const IotMethaneMonitoringAlarmIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#methane-monitoring-alarm" />
    </svg>,
    'MethaneMonitoringAlarmIcon',
);

export const IotDisabledIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#disabled" />
    </svg>,
    'DisabledIcon',
);

export const IotPushButtonIdleIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#push-button-idle" />
    </svg>,
    'PushButtonIdleIcon',
);

export const IotDarknessIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#darkness" />
    </svg>,
    'DarknessIcon',
);

export const IotHighLevelIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#high-level" />
    </svg>,
    'HighLevelIcon',
);

export const IotPushButtonShortPressIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#push-button-short-press" />
    </svg>,
    'PushButtonShortPressIcon',
);

export const IotPushButtonTriggerIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#push-button-trigger" />
    </svg>,
    'PushButtonTriggerIcon',
);

export const IotLowLevelIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#low-level" />
    </svg>,
    'LowLevelIcon',
);

export const IotRemainCapacityIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#remain-capacity" />
    </svg>,
    'RemainCapacityIcon',
);

export const IotTextIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#text" />
    </svg>,
    'TextIcon',
);

export const IotPushButtonLongPressIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#push-button-long-press" />
    </svg>,
    'PushButtonLongPressIcon',
);

export const IotNotPerformIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#not-perform" />
    </svg>,
    'NotPerformIcon',
);

export const IotDistance2Icon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#distance2" />
    </svg>,
    'Distance2Icon',
);

export const IotPirOccupancyStatusOccupancyIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#pir-occupancy-status-occupancy" />
    </svg>,
    'PirOccupancyStatusOccupancyIcon',
);

export const IotOccupancyStatusEngagedIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#occupancy-status-engaged" />
    </svg>,
    'OccupancyStatusEngagedIcon',
);

export const IotOccupancyStatusFreeIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#occupancy-status-free" />
    </svg>,
    'OccupancyStatusFreeIcon',
);

export const IotTemperatureControlStatusStandbyIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#temperature-control-status-standby" />
    </svg>,
    'TemperatureControlStatusStandbyIcon',
);

export const IotLocationLongitudeIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#location-longitude" />
    </svg>,
    'LocationLongitudeIcon',
);

export const IotQuantityIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#quantity" />
    </svg>,
    'QuantityIcon',
);

export const IotRegionOccupiedIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#region-occupied" />
    </svg>,
    'RegionOccupiedIcon',
);

export const IotTemperatureControlStatusHeatingEmergencyIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#temperature-control-status-heating-emergency" />
    </svg>,
    'TemperatureControlStatusHeatingEmergencyIcon',
);

export const IotTemperatureControlStatusHeatingLevel2Icon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#temperature-control-status-heating-level2" />
    </svg>,
    'TemperatureControlStatusHeatingLevel2Icon',
);

export const IotPropaneMonitoringAlarmIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#propane-monitoring-alarm" />
    </svg>,
    'PropaneMonitoringAlarmIcon',
);

export const IotTemperatureControlStatusCoolingLevel1Icon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#temperature-control-status-cooling-level1" />
    </svg>,
    'TemperatureControlStatusCoolingLevel1Icon',
);

export const IotRegionCountIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#region-count" />
    </svg>,
    'RegionCountIcon',
);

export const IotSolenoidValveCloseIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#solenoid-valve-close" />
    </svg>,
    'SolenoidValveCloseIcon',
);

export const IotFormulaIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#formula" />
    </svg>,
    'FormulaIcon',
);

export const IotPushButtonDoubleClickIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#push-button-double-click" />
    </svg>,
    'PushButtonDoubleClickIcon',
);

export const IotCumulativeWaterConsumptionIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#cumulativeWaterConsumption" />
    </svg>,
    'CumulativeWaterConsumptionIcon',
);

export const IotTemperatureControlStatusHeatingLevel1Icon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#temperature-control-status-heating-level1" />
    </svg>,
    'TemperatureControlStatusHeatingLevel1Icon',
);

export const IotSdiIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#sdi" />
    </svg>,
    'SdiIcon',
);

export const IotLocationLatitudeIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#location-latitude" />
    </svg>,
    'LocationLatitudeIcon',
);

export const IotIlluminanceLevelIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#illuminance-level" />
    </svg>,
    'IlluminanceLevelIcon',
);

export const IotImageIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#image" />
    </svg>,
    'ImageIcon',
);

export const IotQrcodeIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#qrcode" />
    </svg>,
    'QrcodeIcon',
);

export const IotEvalIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#eVal" />
    </svg>,
    'EvalIcon',
);

export const IotXDistanceAlarmIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#x-distancealarm" />
    </svg>,
    'XDistanceAlarmIcon',
);

export const IotWaterOutageTimeoutAlarmIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#water-outage-timeout-alarm" />
    </svg>,
    'WaterOutageTimeoutAlarmIcon',
);

export const IotPowerConsumptionAlarmIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#power-consumption-alarm" />
    </svg>,
    'PowerConsumptionAlarmIcon',
);

export const IotAngleYAlertIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#angle-y-alert" />
    </svg>,
    'AngleYAlertIcon',
);

export const IotPulseWaterMeterTwoIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#pulseWaterMeter-TWO" />
    </svg>,
    'PulseWaterMeterTwoIcon',
);

export const IotWaterFlowTimeoutAlarmIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#water-flow-timeout-alarm" />
    </svg>,
    'WaterFlowTimeoutAlarmIcon',
);

export const IotTemperatureAlert1Icon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#temperatureAlert_1" />
    </svg>,
    'TemperatureAlert1Icon',
);

export const IotAngleXAlertIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#angle-x-alert" />
    </svg>,
    'AngleXAlertIcon',
);

export const IotInstallationStatusAlertIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#installation-status-alets" />
    </svg>,
    'InstallationStatusAlertIcon',
);

export const IotWaterLevelTwoIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#waterLevel-TWO" />
    </svg>,
    'WaterLevelTwoIcon',
);

export const IotAngleZAlertIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#angle-z-alert" />
    </svg>,
    'AngleZAlertIcon',
);

export const IotCurrentThresholdAlarmIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#current-threshold-alarm" />
    </svg>,
    'CurrentThresholdAlarmIcon',
);

export const IotDoAlarmIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#doalarm" />
    </svg>,
    'DoAlarmIcon',
);

export const IotLeakDetectionAlarmIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#leak-detection-alarm" />
    </svg>,
    'LeakDetectionAlarmIcon',
);

export const IotPressureTwoIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#pressure-TWO" />
    </svg>,
    'PressureTwoIcon',
);

export const IotFreezeProtectionStatusAlarmIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#freeze-protection-status-alarm" />
    </svg>,
    'FreezeProtectionStatusAlarmIcon',
);

export const IotTemperatureIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#temperature" />
    </svg>,
    'TemperatureIcon',
);

export const IotAngleZIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#angle-z" />
    </svg>,
    'AngleZIcon',
);

export const IotInstalledIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#installed" />
    </svg>,
    'InstalledIcon',
);

export const IotpressureIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#pressure" />
    </svg>,
    'xxxIcon',
);

export const IotWaterOutageTimeoutNormalIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#water-outage-timeout-normal" />
    </svg>,
    'WaterOutageTimeoutNormalIcon',
);

export const IotAngleXIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#angle-x" />
    </svg>,
    'AngleXIcon',
);

export const IotPowerConsumptionIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#power-consumption" />
    </svg>,
    'PowerConsumptionIcon',
);

export const IotDistanceIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#distance" />
    </svg>,
    'DistanceIcon',
);

export const IotAngleYIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#angle-y" />
    </svg>,
    'AngleYIcon',
);

export const IotWaterLevelIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#water-level" />
    </svg>,
    'WaterLevelIcon',
);

export const IotFreezeProtectionStatusNormalIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#freeze-protection-status-normal" />
    </svg>,
    'FreezeProtectionStatusNormalIcon',
);

export const IotLeakDetectionNormalIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#leak-detection-normal" />
    </svg>,
    'LeakDetectionNormalIcon',
);

export const IotWaterFlowTimeoutNormalIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#water-flow-timeout-normal" />
    </svg>,
    'WaterFlowTimeoutNormalIcon',
);

export const IotCurrentThresholdNormalIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#current-threshold-normal" />
    </svg>,
    'CurrentThresholdNormalIcon',
);

export const IotDoitIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#dout" />
    </svg>,
    'DoitIcon',
);

export const IotDoorOpenIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#door-open" />
    </svg>,
    'DoorOpenIcon',
);

export const IotWindowStatusOffIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#window-status-off" />
    </svg>,
    'WindowStatusOffIcon',
);

export const IotInclinationTriggerInactiveIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#inclination-trigger-inactive" />
    </svg>,
    'InclinationTriggerInactiveIcon',
);

export const IotMotorStrokeTwoIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#motorStroke-TWO" />
    </svg>,
    'MotorStrokeTwoIcon',
);

export const IotOccupancyStatusIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#occupancyStatus" />
    </svg>,
    'OccupancyStatusIcon',
);

export const IotGeoFencingMonitoringNormalIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#geofencing-monitoring-normal" />
    </svg>,
    'GeoFencingMonitoringNormalIcon',
);

export const IotGeoFencingMonitoringOutAlarmIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#geofencing-monitoring-out-alarm" />
    </svg>,
    'GeoFencingMonitoringOutAlarmIcon',
);

export const IotOccupancyStatusWS203TwoIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#occupancyStatus-WS203-TWO" />
    </svg>,
    'OccupancyStatusWS203TwoIcon',
);

export const IotWindowStatusOnIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#window-status-on" />
    </svg>,
    'WindowStatusOnIcon',
);

export const IotInclinationTriggerIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#inclination-trigger" />
    </svg>,
    'InclinationTriggerIcon',
);

export const IotOccupancyStatusWS203Icon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#occupancyStatus-WS203" />
    </svg>,
    'OccupancyStatusWS203Icon',
);

export const IotOccupancyStatusTwoIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#occupancyStatus-TWO" />
    </svg>,
    'OccupancyStatusTwoIcon',
);

export const IotMotorStrokeIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#motor-stroke" />
    </svg>,
    'MotorStrokeIcon',
);

export const IotDoorCloseIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#door-close" />
    </svg>,
    'IotDoorCloseIcon',
);

export const IotMethaneMonitoringNormalIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#methane-monitoring-normal" />
    </svg>,
    'MethaneMonitoringNormalIcon',
);

export const IotPm10Icon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#pm10" />
    </svg>,
    'Pm10Icon',
);

export const IotPushButton0Icon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#pushButton_0" />
    </svg>,
    'PushButton0Icon',
);

export const IotH2SIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#h2s" />
    </svg>,
    'H2SIcon',
);

export const IotRegionPeopleCountIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#region-people-count" />
    </svg>,
    'RegionPeopleCountIcon',
);

export const IotO3Icon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#o3" />
    </svg>,
    'O3Icon',
);

export const IotCo2Icon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#co2" />
    </svg>,
    'Co2Icon',
);

export const IotPeopleOutIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#people-out" />
    </svg>,
    'PeopleOutIcon',
);

export const IotPirOccupancyStatusIdleIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#pir-occupancy-status-idle" />
    </svg>,
    'PirOccupancyStatusIdleIcon',
);

export const IotPeopleFlowCountIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#people-flow-count" />
    </svg>,
    'PeopleFlowCountIcon',
);

export const IotHchoIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#hcho" />
    </svg>,
    'HchoIcon',
);

export const IotRegionFreeIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#region-free" />
    </svg>,
    'RegionFreeIcon',
);

export const IotNh3Icon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#nh3" />
    </svg>,
    'Nh3Icon',
);

export const IotPeopleInIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#people-in" />
    </svg>,
    'PeopleInIcon',
);

export const IotPeopleInTotalIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#people-in-total" />
    </svg>,
    'PeopleInTotalIcon',
);

export const IotCoIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#co" />
    </svg>,
    'CoIcon',
);

export const IotPeopleOutTotalIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#people-out-total" />
    </svg>,
    'PeopleOutTotalIcon',
);

export const IotIlluminanceIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#illuminance" />
    </svg>,
    'IlluminanceIcon',
);

export const IotLightStatus1Icon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#lightStatus_1" />
    </svg>,
    'LightStatus1Icon',
);

export const IotTemperatureControlStatus3Icon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#temperatureControlStatus-3" />
    </svg>,
    'TemperatureControlStatus3Icon',
);

export const IotConductivityIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#conductivity" />
    </svg>,
    'ConductivityIcon',
);

export const IotTemperatureControlStatusHeatingLevel4Icon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#temperature-control-status-heating-level4" />
    </svg>,
    'TemperatureControlStatusHeatingLevel4Icon',
);

export const IotTemperatureControlStatusHeatingLevel3Icon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#temperature-control-status-heating-level3" />
    </svg>,
    'TemperatureControlStatusHeatingLevel3Icon',
);

export const IotDiIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#di" />
    </svg>,
    'DiIcon',
);

export const IotLiquidLevelStatusUncalibratedIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#liquid-level-status-uncalibrated" />
    </svg>,
    'LiquidLevelStatusUncalibratedIcon',
);

export const IotWindDirectionIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#wind-direction" />
    </svg>,
    'WindDirectionIcon',
);

export const IotVoltageIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#voltage" />
    </svg>,
    'VoltageIcon',
);

export const IotCounterIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#counter" />
    </svg>,
    'CounterIcon',
);

export const IotLiquidLevelStatusLowIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#liquid-level-status-low" />
    </svg>,
    'LiquidLevelStatusLowIcon',
);

export const IotCurrentIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#current" />
    </svg>,
    'CurrentIcon',
);

export const IotLiquidLevelStatusFullIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#liquid-level-status-full" />
    </svg>,
    'LiquidLevelStatusFullIcon',
);

export const IotModeWakeUpIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#mode-wake-up" />
    </svg>,
    'ModeWakeUpIcon',
);

export const IotMotorPositionIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#motor-position" />
    </svg>,
    'MotorPositionIcon',
);

export const IotPeopleCountIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#people-count" />
    </svg>,
    'PeopleCountIcon',
);

export const IotZxcIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#zxc" />
    </svg>,
    'ZxcIcon',
);

export const IotFanStatusHighSpeedIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#fan-status-high-speed" />
    </svg>,
    'FanStatusHighSpeedIcon',
);

export const IotPirIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#pir" />
    </svg>,
    'IotPirIcon',
);

export const IotMaximumSoundLevelIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#maximum-sound-level" />
    </svg>,
    'MaximumSoundLevelIcon',
);

export const IotContinuousSoundLevelIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#continuousSoundLevel" />
    </svg>,
    'ContinuousSoundLevelIcon',
);

export const IotSoundLevelIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#sound-level" />
    </svg>,
    'IotSoundLevelIcon',
);

export const IotFanStatusLowSpeedIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#fan-status-low-speed" />
    </svg>,
    'FanStatusLowSpeedIcon',
);

export const IotPropaneMonitoringNormalIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#propane-monitoring-normal" />
    </svg>,
    'PropaneMonitoringNormalIcon',
);

export const IotFanStatusOpenIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#fan-status-open" />
    </svg>,
    'FanStatusOpenIcon',
);

export const IotPowerFactorIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#power-factor" />
    </svg>,
    'PowerFactorIcon',
);

export const IotPm2P5Icon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#pm2p5" />
    </svg>,
    'Pm2P5Icon',
);

export const IotElectricPowerIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#electric-power" />
    </svg>,
    'ElectricPowerIcon',
);

export const IotBatteryIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#battery" />
    </svg>,
    'BatteryIcon',
);

export const IotTemperatureFluctuationIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#temperature-fluctuation" />
    </svg>,
    'TemperatureFluctuationIcon',
);

export const IotHumidityIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#humidity" />
    </svg>,
    'HumidityIcon',
);

export const IotModeAwayIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#mode-away" />
    </svg>,
    'IotModeAwayIcon',
);

export const IotPulseWaterMeterIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#pulse-water-meter" />
    </svg>,
    'PulseWaterMeterIcon',
);

export const IotParIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#par" />
    </svg>,
    'ParIcon',
);

export const IotTvocIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#tvoc" />
    </svg>,
    'TvocIcon',
);

export const IotTemperatureControlStatusCoolingLevel2Icon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#temperature-control-status-cooling-level2" />
    </svg>,
    'TemperatureControlStatusCoolingLevel2Icon',
);

export const IotAccumulatedKiloAmpereHourIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#accumulated-kiloampere-hour" />
    </svg>,
    'AccumulatedKiloAmpereHourIcon',
);

export const IotModeSleepIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#mode-sleep" />
    </svg>,
    'ModeSleepIcon',
);

export const IotWindVelocityIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#wind-velocity" />
    </svg>,
    'WindVelocityIcon',
);

export const IotPir400TwoIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#pir-400-TWO" />
    </svg>,
    'Pir400TwoIcon',
);

export const IotPir400Icon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#pir-400" />
    </svg>,
    'Pir400Icon',
);

export const IotOtherIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#other" />
    </svg>,
    'OtherIcon',
);

export const IotAirPressureIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#air-pressure" />
    </svg>,
    'AirPressureIcon',
);

export const IotModeHomecomingIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#mode-homecoming" />
    </svg>,
    'ModeHomecomingIcon',
);
