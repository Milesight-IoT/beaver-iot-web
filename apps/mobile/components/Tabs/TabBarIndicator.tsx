import * as React from 'react';
import {
	Animated,
	Easing,
	I18nManager,
	Platform,
	StyleProp,
	StyleSheet,
	ViewStyle,
} from 'react-native';
import type { NavigationState, Route, SceneRendererProps } from 'react-native-tab-view';
import { get } from 'lodash';

import { useAnimatedValue } from './useAnimatedValue';

export type GetTabWidth = (index: number) => number;

export type TabBarIndicatorProps<T extends Route> = SceneRendererProps & {
	navigationState: NavigationState<T>;
	width: string | number;
	style?: StyleProp<ViewStyle>;
	getTabWidth: GetTabWidth;
	gap?: number;
};

const getTranslateX = (
	position: Animated.AnimatedInterpolation<number>,
	routes: Route[],
	getTabWidth: GetTabWidth,
	width: number | string,
	gap?: number
) => {
	if(routes.length === 1) {
		const tabWidth = getTabWidth(0);
		const indicatorWidth = typeof width === 'string' ? 0 : width;
		// 由于只有一个Tab，我们可以直接计算中心偏移
		return (tabWidth - indicatorWidth) / 2;
	}

	const inputRange = routes.map((_, i) => i);
	// 计算指示器应该位于每个Tab中心时的translateX值
	const outputRange = routes.map((_, i) => {
		// 为了居中指示器，我们需要计算到当前Tab中心的距离
		// 这包括了之前所有Tab的宽度、当前Tab宽度的一半，以及所有间隙的总和
		// 减去指示器宽度的一半，以确保指示器居中
		let totalWidth = 0;
		for (let j = 0; j <= i; j++) {
			totalWidth += getTabWidth(j) + (j < i ? gap ?? 0 : 0);
		}
		const indicatorWidth = typeof width === 'string' ? 0 : width;
		const currentTabHalfWidth = getTabWidth(i) / 2;
		const centerOffset = currentTabHalfWidth - indicatorWidth / 2;
		return totalWidth - getTabWidth(i) + centerOffset;
	});

	const translateX = position.interpolate({
		inputRange,
		outputRange,
		extrapolate: 'clamp',
	});

	return Animated.multiply(translateX, I18nManager.isRTL ? -1 : 1);
};

export function TabBarIndicator<T extends Route>({
	getTabWidth,
	layout,
	navigationState,
	position,
	width,
	gap,
	style,
}: TabBarIndicatorProps<T>) {
	const isIndicatorShown = React.useRef(false);
	const isWidthDynamic = width === 'auto';
	const opacity = useAnimatedValue(isWidthDynamic ? 0 : 1);
	const indicatorVisible = isWidthDynamic
		? layout.width &&
			navigationState.routes
				.slice(0, navigationState.index)
				.every((_, r) => getTabWidth(r))
		: true;

	React.useEffect(() => {
		const fadeInIndicator = () => {
			if (
				!isIndicatorShown.current &&
				isWidthDynamic &&
				// We should fade-in the indicator when we have widths for all the tab items
				indicatorVisible
			) {
				isIndicatorShown.current = true;

				Animated.timing(opacity, {
					toValue: 1,
					duration: 150,
					easing: Easing.in(Easing.linear),
					useNativeDriver: true,
				}).start();
			}
		};

		fadeInIndicator();

		return () => opacity.stopAnimation();
	}, [ indicatorVisible, isWidthDynamic, opacity ]);

	const { routes } = navigationState;
	const transform = [];

	if (layout.width) {
		const indicatorWidth = get(style, 'width', styles.indicator.width) as string;
		const translateX = getTranslateX(position, routes, getTabWidth, indicatorWidth, gap);

		transform.push({ translateX });
	}

	return (
		<Animated.View
			style={[
				styles.indicator,
				// { width: width === 'auto' ? 1 : width },
				// If layout is not available, use `left` property for positioning the indicator
				// This avoids rendering delay until we are able to calculate translateX
				// If platform is macos use `left` property as `transform` is broken at the moment.
				// See: https://github.com/microsoft/react-native-macos/issues/280
				layout.width && Platform.OS !== 'macos'
					? { left: 0 }
					: { left: `${(100 / routes.length) * navigationState.index}%` },
				{ transform },
				width === 'auto' ? { opacity: opacity } : null,
				style,
			]}
		/>
	);
}

const styles = StyleSheet.create({
	indicator: {
		backgroundColor: '#2563eb',
		height: 3,
		borderRadius: 999,
		position: 'absolute',
		left: 0,
		bottom: 0,
		right: 0,
		width: 24
	},
});
