import { useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaFrame } from 'react-native-safe-area-context';

import { useStatusBarHeight } from './useStatusBarHeight';

interface Layout {
	width: number;
	height: number
}

export function useHeaderHeight() {
	const frame = useSafeAreaFrame();
	const statusBarHeight = useStatusBarHeight();

	const getDefaultHeaderHeight = useCallback((
		layout: Layout,
		modalPresentation: boolean,
		statusBarHeight: number
	) => {
		let headerHeight;
		const isLandscape = layout.width > layout.height;

		if (Platform.OS === 'ios') {
			if (Platform.isPad || Platform.isTV) {
				if (modalPresentation) {
					headerHeight = 56;
				} else {
					headerHeight = 50;
				}
			} else {
				if (isLandscape) {
					headerHeight = 32;
				} else {
					if (modalPresentation) {
						headerHeight = 56;
					} else {
						headerHeight = 44;
					}
				}
			}
		} else if (Platform.OS === 'android') {
			headerHeight = 56;
		} else {
			headerHeight = 64;
		}

		return headerHeight + statusBarHeight;
	}, []);

	const headerHeight = useMemo(() => {
		return getDefaultHeaderHeight(frame, false, statusBarHeight);
	}, [ frame, getDefaultHeaderHeight, statusBarHeight ]);

	return headerHeight;
}