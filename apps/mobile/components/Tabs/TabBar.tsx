import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Animated } from 'react-native';

import { Tab } from './types';
import { TabBar as BaseTabBar, Props as BaseTabBarProps } from './BaseTabBar';

export type TabBarProps = BaseTabBarProps<Tab> & {
	backgroundColor?: string;
};

export function TabBar(props: TabBarProps) {
	const { backgroundColor = '#fff'	} = props;
	const { activeColor, inactiveColor, pressColor } = useMemo(() => {
		return {
			activeColor: '#262626',
			inactiveColor: '#A3A3A3',
			pressColor: '#E5E6EB'
		};
	}, []);
	const renderLabel = useCallback((props: {
    route: Tab;
    focused: boolean;
    color: string;
  }) => {
		if (!props.route.title) {
			return null;
		}

		return (
			<Animated.Text
				style={[
					styles.labelStyle,
					{ 
						color: props.color, 
						fontWeight: props.focused ? '500' : '400'
					},
				]}
			>
				{props.route.title}
			</Animated.Text>
		);
	}, []);

	return (
		<BaseTabBar
			contentContainerStyle={styles.contentContainerStyle}
			activeColor={activeColor}
			inactiveColor={inactiveColor}
			pressColor={pressColor}
			scrollEnabled={props.scrollEnabled}
			labelStyle={styles.labelStyle}
			tabStyle={styles.tabStyle}
			style={[ styles.barStyle, { backgroundColor }, props.style ]}
			renderLabel={renderLabel}
			{...props}
		/>
	);
}

const styles = StyleSheet.create({
	contentContainerStyle: {
		height: 48
	},
	barStyle: {
		elevation: 0,
		shadowColor: 'transparent',
		shadowOpacity: 0,
		shadowOffset: {
			width: 0,
			height: 0
		}
	},
	labelStyle: {
		fontSize: 16,
		width: '110%',
		textAlign: 'center',
		lineHeight: 24,
		fontWeight: '400',
		textTransform: 'none'
	},
	tabStyle: {
		paddingLeft: 16,
		paddingRight: 16,
		width: 'auto'
	}
});
