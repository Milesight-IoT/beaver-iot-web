import { useMemo } from 'react';
import { router, usePathname } from 'expo-router';
import { Box, Text, Avatar, Pressable, Image, Heading, Icon, TemplateIcon } from '@ms-mobile-ui/themed';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useI18n from '@milesight/shared/src/hooks/useI18n';
import { useRequest } from 'ahooks';
import * as Haptics from 'expo-haptics';

import { useUserStore } from '@/stores';
import { awaitWrap, getResponseData, globalAPI, isRequestSuccess } from '@/services/http';

export function DrawerContent() {
	const insets = useSafeAreaInsets();
	const { getIntlText } = useI18n();
	const pathname = usePathname();
	const {
		setUserInfo,
		userInfo
	} = useUserStore(state => ({
		setUserInfo: state.setUserInfo,
		userInfo: state.userInfo,
	}));

	const { username, avatarName } = useMemo(() => {
		return {
			username: userInfo?.nickname,
			avatarName: userInfo?.nickname?.slice(0, 2)?.toUpperCase(),
		};
	}, [userInfo]);

	const handleDashboard = () => {
		if (process.env.EXPO_OS === 'ios') {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		router.navigate('/(home)');
	};

	const handleUser = () => {
		if (process.env.EXPO_OS === 'ios') {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		router.navigate('/user');
	};

	useRequest(
		async () => {
			const [error, resp] = await awaitWrap(globalAPI.getUserInfo());

			if (error || !isRequestSuccess(resp)) return;
			setUserInfo(getResponseData(resp));
		},
		{
			debounceWait: 300,
		},
	);

	return (
		<Box
			flex={1}
			pt={insets.top - 15}
		>
			{/* 标题 */}
			<Box
				p={10}
				borderBottomWidth={1}
				borderBottomColor="$borderLight200"
			>
				<Image
					source={require('@/assets/images/splash-icon.png')}
					style={{
						width: 130,
						height: 32,
					}}
					alt="logo"
				/>
			</Box>

			{/* 主要菜单项 */}
			<Box flex={1}>
				<Pressable
					flexDirection="row"
					alignItems="center"
					p={15}
					bg={pathname === '/' ? '$blue50' : '$white'}
					onPress={handleDashboard}
				>
					<Icon as={TemplateIcon} size="md" color={pathname === '/' ? '#03a9f4' : '$gray500'} />
					<Text ml={15} color={pathname === '/' ? '#03a9f4' : '$gray500'}>
						{getIntlText('common.label.dashboard')}
					</Text>
				</Pressable>
			</Box>

			{/* 底部用户信息和通知 */}
			<Box
				borderTopWidth="$1"
				borderTopColor="#0000001f"
				$ios-paddingBottom={15}
				$android-paddingBottom={15}
			>
				<Pressable
					flexDirection="row"
					alignItems="center"
					p={10}
					onPress={handleUser}
				>
					<Avatar size="sm" bg="$blue400">
						<Text color="$white">{avatarName}</Text>
					</Avatar>
					<Heading
						//@ts-ignore
						size="md"
						ml={15}
						_dark={{
							color: '$white',
						}}
					>
						{username}
					</Heading>
				</Pressable>
			</Box>
		</Box>
	);
}
