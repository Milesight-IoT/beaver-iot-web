import React, { useMemo } from 'react';
import { StyleSheet, TextStyle } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

interface DashboardIconProps {
	name: string;
  color?: string;
	size?: number;
	style?: TextStyle;
};

const MaterialIconsNameMap = {
	CheckCircleIcon: 'check-circle',
	PlayArrowIcon: 'play-arrow',
	CancelIcon: 'cancel',
	IotLocationLongitudeIcon: 'public',
	AirIcon: 'air',
	DeleteIcon: 'delete',
	AccountCircleIcon: 'account-circle',
	IotTemperatureIcon: 'thermostat',
	IotSolenoidValveOpenIcon: 'water-drop',
	AdsClickIcon: 'ads-click',
	IotDoorCloseIcon: 'lock',
	IotDoorOpenIcon: 'lock-open',
	IotCo2Icon: 'co2',
	IotBatteryIcon: 'battery-full',
	IotHumidityIcon: 'water-drop',
	IotDarknessIcon: 'brightness-4',
	IotLightStatus1Icon: 'sunny',
	IotModeAwayIcon: 'work',
	UnknownIcon: 'help',
};

const MaterialCommunityIconsNameMap = {
	HomeIcon: 'home',
	IotFanStatusOpenIcon: 'fan',
	IotFanModeDisabledIcon: 'fan-off',
};

const DashboardIcon = (props: DashboardIconProps) => {
    const { name, color, size = 22, style = styles.icon } = props;
		const { iconName, iconType } = useMemo(() => {
			const materialIconName = MaterialIconsNameMap[name as keyof typeof MaterialIconsNameMap];
			const materialCommunityIconName = MaterialCommunityIconsNameMap[name as keyof typeof MaterialCommunityIconsNameMap];

			return {
				iconName: materialIconName ?? materialCommunityIconName ?? MaterialIconsNameMap.UnknownIcon,
				iconType: materialIconName ? 'MaterialIcons' : 'MaterialCommunityIcons',
			};
		}, [name]);
		const Icon = iconType === 'MaterialIcons' ? MaterialIcons : MaterialCommunityIcons;

    return (
			<Icon
				name={iconName as any}
				color={color}
				size={size}
				style={style}
			/>
    );
};

const styles = StyleSheet.create({
    icon: {
			width: 22,
			height: 22,
		}
});

export default DashboardIcon;
