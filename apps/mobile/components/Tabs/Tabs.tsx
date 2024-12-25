import React, { ReactNode, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { TabView } from 'react-native-tab-view';
import { useMemoizedFn } from 'ahooks';
import { View } from '@ms-mobile-ui/themed';

import { Tab as ITab, MenuKey } from './types';
import { TabBarProps, TabBar } from './TabBar';
import { MoreMenuItem } from './MoreMenuItem';
import { useMenuItem } from './useMenuItem';

interface TabsProps<T extends ITab> {
  tabs: T[];
  activeIndex: number;
  onTabChange?: (tab: T, index: number) => void;
  renderTabView?: (tab: T, index: number) => ReactNode;
  renderTabBar?: (tabBarProps: any) => ReactNode;
	lazy?: ((props: { route: T }) => boolean) | boolean;
	lazyPreloadDistance?: number;
	renderLazyPlaceholder?: (props: { route: T }) => React.ReactNode;
	backgroundColor?: string;
}

export function Tabs<T extends ITab>(props: TabsProps<T>) {
	const { tabs = [], activeIndex, lazy = false, lazyPreloadDistance, renderLazyPlaceholder, backgroundColor } = props;
	const layout = useWindowDimensions();
	const { getMenuItemVisible, getMenuOptions } = useMenuItem();
	const [ tabBarWidth, setTabBarWidth ] = useState({
		width: 0,
		tabWidths: {}
	});

	const { moreMenuOptions, moreMenuItemVisible } = useMemo(() => {
		const allOptions = tabs.map(tab => ({
			key: tab.key,
			textValue: tab.title
		}));
		const menuItemVisible = getMenuItemVisible(tabBarWidth.width, layout.width);
		//判断超出tab是否超出屏幕，如果是则展示更多按钮；更多按钮里面展示所有的tab
		const overFlowMenuOptions = menuItemVisible ? getMenuOptions({
			options: allOptions,
			menuWidth: tabBarWidth.tabWidths,
			layoutWidth: layout.width
		}) : [];
		const moreMenuItemVisible = overFlowMenuOptions.length > 0;

		return {
			moreMenuOptions: allOptions,
			moreMenuItemVisible
		};
	}, [ tabs, getMenuItemVisible, tabBarWidth.width, tabBarWidth.tabWidths, layout.width, getMenuOptions ]);

	const renderScene = useMemoizedFn(({ route }: { route: T }) => {
		const tabIndex = tabs.findIndex(tab => tab.key === route.key);

		return props.renderTabView?.(route, tabIndex) ?? null;
	});

	const onIndexChange = useMemoizedFn((index: number) => {
		const tab = tabs[index];

		props.onTabChange?.(tab, index);
	});

	const onTabBarWidthChange = useMemoizedFn((width: number, tabWidths: { [key: string]: number }) => {
		setTabBarWidth({
			width,
			tabWidths
		});
	});

	const onMenuChange = useMemoizedFn((menuKey: MenuKey) => {
		const findTab = tabs.find(p => p.key === menuKey.key);
		const findTabIndex = tabs.findIndex(p => p.key === menuKey.key);

		if(findTab) {
			props.onTabChange?.(findTab, findTabIndex);
		}
	});

	const renderTabBar = useMemoizedFn((tabBarProps: TabBarProps) => {
		if(props.renderTabBar != null) {
			return props.renderTabBar(tabBarProps);
		}

		return (
			<View
				position="relative"
			>
				<TabBar
					onTabBarWidthChange={onTabBarWidthChange}
					scrollEnabled={moreMenuItemVisible}
					backgroundColor={backgroundColor}
					{...tabBarProps}
				/>
				<MoreMenuItem
					visible={moreMenuItemVisible}
					options={moreMenuOptions}
					onMenuChange={onMenuChange}
					backgroundColor={backgroundColor}
				/>
			</View>
		);
	});

	return (
		<TabView
			navigationState={{ index: activeIndex, routes: tabs }}
			renderScene={renderScene}
			onIndexChange={onIndexChange}
			initialLayout={{ width: layout.width }}
			renderTabBar={renderTabBar}
			lazy={lazy}
			lazyPreloadDistance={lazyPreloadDistance}
			renderLazyPlaceholder={renderLazyPlaceholder}
			swipeEnabled={false}
			pagerStyle={{ backgroundColor: '#f0f0f0' }}
		/>
	);
}