import { useMemo } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useStatusBarHeight() {
	const insets = useSafeAreaInsets();

	const statusBarHeight = useMemo(() => {
		const hasDynamicIsland = Platform.OS === 'ios' && insets.top > 50;
		return hasDynamicIsland ? insets.top - 5 : insets.top;
	}, [insets.top]);

	return statusBarHeight;
}