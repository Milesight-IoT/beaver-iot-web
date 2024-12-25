import { Dimensions } from 'react-native';

import { MenuKey } from './types';

//58实际宽度 + 2 的冗余
export const MENU_ITEM_WIDTH = 60;

/**
 * 判断菜单项是否可见
 * @param tabBarWidth - TabBar的宽度
 * @param layoutWidth - Layout的宽度
 * @returns 
 */
export function getMenuItemVisible(tabBarWidth: number, layoutWidth?: number) {
	const width = layoutWidth || Dimensions.get('window').width;

	return tabBarWidth > width;
}

export function getMenuOptions({
	options,
	menuWidth,
	layoutWidth
}: {
	options: MenuKey[];
	menuWidth: Record<string, number>;
	layoutWidth: number
}) {
	const result: MenuKey[] = [];
	let width = 0;

	for(let i = 0; i < options.length; i++) {
		const option = options[i];
		const optionWidth = menuWidth[option.key];
		//当前宽度 + 选项宽度 + 菜单项宽度
		const currentWidth = width + optionWidth + (optionWidth / 3);
		//当前宽度大于布局宽度表示被遮挡，不可见
		const isNotVisible = currentWidth > layoutWidth;

		if(isNotVisible) {
			result.push(option);
		} else {
			width += optionWidth;
		}
	}

	return result;
}

export function useMenuItem() {
	return {
		getMenuItemVisible,
		getMenuOptions,
		menuItemWidth: MENU_ITEM_WIDTH
	};
}