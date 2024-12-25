import type { Route } from 'react-native-tab-view';
export type {
	Route,
	NavigationState,
	SceneRendererProps,
	TabBarItemProps
} from 'react-native-tab-view';

export interface Event {
  defaultPrevented: boolean;
  preventDefault(): void;
}

export interface Scene<T extends Route> {
  route: T;
}

export interface Layout {
  width: number;
  height: number;
}

export interface Tab {
	/**
	 * tab的key，例如 "device" 或 "network"
	 */
	key: string;

	/**
	 * tab的标题标题，例如 "Device" 或 "Network"
	 */
	title: string;
}

/**
 * 菜单项
 */
export interface MenuKey {
	key: string;
	textValue: string;
}