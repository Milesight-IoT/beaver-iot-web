import React from 'react';
import { StyleSheet } from 'react-native';
import { View, Menu, MenuItem, MenuItemLabel, Pressable, Icon, MenuIcon, ScrollView } from '@ms-mobile-ui/themed';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { MenuKey } from './types';

type Selection = 'all' | Set<string | number>;

export interface MoreMenuItemProps {
	visible: boolean;
	options: MenuKey[];
	onMenuChange: (key: MenuKey) => void;
	backgroundColor?: string;
}

/**
 * 更多菜单项
 */
export function MoreMenuItem(props: MoreMenuItemProps) {
	const { visible, options, backgroundColor = '#fff' } = props;
	const onSelectionChange = (keys: Selection) => {
		const findKey = options.find(option => {
			//因为是单选模式，所以该情况不会出现，这里只做类型排除
			if(keys === 'all') {
				return option.key === 'all';
			}

			return keys.has(option.key);
		});

		if(findKey) {
			props.onMenuChange(findKey);
		}
	};

	if(!visible) {
		return null;
	}

	return (
		<Menu
			placement="bottom right"
			trigger={({ ...triggerProps }) => {
				return (
					<Animated.View
						style={[
							styles.menuContainer,
							{ backgroundColor }
						]}
						entering={FadeIn}
						exiting={FadeOut}
					>
						<Pressable
							{...triggerProps}
							borderColor={triggerProps['aria-expanded'] ? "$Blue6" : "$borderLight200"}
							borderWidth="$1"
							borderRadius="$lg"
							alignItems="center"
							justifyContent="center"
							backgroundColor="transparent"
							px="$2"
							py="$2"
						>
							<View
								width="$4"
								justifyContent="center"
								alignItems="center"
							>
								<Icon as={MenuIcon} size="xs" 	color={triggerProps['aria-expanded'] ? "$Blue6" : "$Gray6"} />
							</View>
					</Pressable>
					</Animated.View>
				);
			}}
			offset={10}
			py="$2"
			selectionMode="single"
			onSelectionChange={onSelectionChange}
		>
			{options.map(option => {
				return (
					<MenuItem
						key={option.key}
						textValue={option.textValue}
						px="$4"
						py={9}
					>
						<MenuItemLabel color="$Gray9" size="md" fontWeight="400">
							{option.textValue}
						</MenuItemLabel>
					</MenuItem>
				);
			})}
		</Menu>
	);
}

const styles = StyleSheet.create({
	menuContainer: {
		position: 'absolute',
		right: 0,
		top: 0,
		zIndex: 1000,
		paddingLeft: 8,
		paddingRight: 16,
		height: 48,
		justifyContent: "center",
		alignItems: "center",
		opacity: 1
	}
});