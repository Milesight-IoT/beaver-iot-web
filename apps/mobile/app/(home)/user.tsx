import { useMemo, useState } from 'react';
import { Modal, TextInput } from 'react-native';
import {
    Box,
    VStack,
    Avatar,
    Text,
    Button,
    ButtonText,
    ScrollView,
    Pressable,
    HStack,
    Input,
    InputSlot,
    InputField,
    InputIcon,
    VisibilityOffIcon,
    VisibilityIcon,
} from '@ms-mobile-ui/themed';
import Toast from 'react-native-toast-message';
import iotStorage, { TOKEN_CACHE_KEY } from '@milesight/shared/src/utils/storage';
import useI18n from '@milesight/shared/src/hooks/useI18n';
import { LANGUAGE } from '@milesight/locales';
import { userNameChecker, passwordChecker } from '@milesight/shared/src/utils/validators';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { globalAPI, awaitWrap } from '@/services/http';
import { useUserStore } from '@/stores';
import { useSession } from '@/hooks';

export default function SettingScreen() {
    const { changeLang, getIntlText, lang } = useI18n();
    const userInfo = useUserStore(state => state.userInfo);
    const setUserInfo = useUserStore(state => state.setUserInfo);
    const { logout } = useSession();

    const isEnglish = useMemo(() => lang === LANGUAGE.EN, [lang]);
    const [isVisible, setIsVisible] = useState(false);
    const [newNickname, setNewNickname] = useState(userInfo?.nickname || '');
    const [error, setError] = useState('');

    // 修改密码相关状态
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    const handleChangeLang = (nextLang: LANGUAGE) => {
        changeLang(nextLang, 'mobile');
    };

    const handleLogout = () => {
        logout();
    };

    // 触发token刷新请求
    const handleRefreshToken = async () => {
        const token = iotStorage.getItem(TOKEN_CACHE_KEY);

        if (token) {
            //让token过期
            token.expires_in = Date.now();
            iotStorage.setItem(TOKEN_CACHE_KEY, token);
            //触发刷新token请求，这里因为使用的还是旧token，返回的还是旧的用户信息，所以这里不做额外处理
            awaitWrap(globalAPI.getUserInfo());
        }
    };

    const handleSaveNickname = async () => {
        const checker = userNameChecker();
        const validationResult = await checker.checkUsername(newNickname, {});

        if (validationResult !== true) {
            setError(validationResult as string);
            return;
        }
        const [error, resp] = await awaitWrap(
            globalAPI.updateNickname({
                email: userInfo?.email || '',
                nickname: newNickname,
            }),
        );

        if (error) {
            console.log("error:", JSON.stringify(error));
            setIsVisible(false);
            Toast.show({
                type: 'error',
                text1: 'Update nickname failed',
            });
            return;
        }

        // 更新用户信息中的昵称
        // @ts-ignore
        setUserInfo({ ...userInfo, nickname: newNickname });
        setIsVisible(false);
        setError('');
        Toast.show({
            type: 'success',
            text1: getIntlText('common.message.operation_success'),
        });
        handleRefreshToken();
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || currentPassword !== newPassword) {
            return;
        }

        const checker = passwordChecker();
        const validationResult = await checker.checkPassword(newPassword, {});
        if (validationResult !== true) {
            return;
        }

        // 这里可以添加实际的修改密码逻辑，例如调用 API
        const [error] = await awaitWrap(
            globalAPI.updatePassword({
                email: userInfo?.email || '',
                password: newPassword,
            }),
        );

        if (error) {
            setIsPasswordModalVisible(false);
            Toast.show({
                type: 'error',
                text1: 'Change password failed',
            });
            return;
        }

        // 重置密码输入框
        setCurrentPassword('');
        setNewPassword('');
        setIsPasswordModalVisible(false);
        Toast.show({
            type: 'success',
            text1: getIntlText('common.message.operation_success'),
        });
    };

    const handleConfirmState = () => {
        setShowConfirmPassword(showConfirmState => {
            return !showConfirmState;
        });
    };
    return (
        <Box flex={1} bg="$white">
            <ScrollView>
                {/* 头部用户信息 */}
                <Box p="$6" bg="$blue50" alignItems="center">
                    <Avatar size="2xl" mb="$3" bg="$blue400">
                        <Text color="$white" fontSize="$3xl" lineHeight="$3xl">
                            {userInfo?.nickname?.slice(0, 2)?.toUpperCase()}
                        </Text>
                    </Avatar>
                    {/* 增加用户名编辑 */}
                    <HStack minWidth={120} justifyContent="space-between" alignItems="center">
                        <Box />
                        <Text size="lg" fontWeight="$semibold" mb="$1" color="$textDark900" ml="$2">
                            {userInfo?.nickname}
                        </Text>
                        {
                            userInfo?.nickname != null && (
                                <MaterialIcons
                                    name="edit"
                                    size={16}
                                    color="$textDark500"
                                    onPress={() => setIsVisible(true)}
                                />
                            )
                        }
                    </HStack>
                    <Text size="sm" color="$textDark500">
                        {userInfo?.email}
                    </Text>
                </Box>

                {/* 主要设置区域 */}
                <VStack space="md" p="$4" flex={1}>
                    <Box py="$3" px="$2">
                        <Text size="md" fontWeight="$medium" color="$textDark900" mb="$2">
                            {getIntlText('common.label.language')}
                        </Text>
                        <HStack
                            borderRadius="$lg"
                            borderWidth={1}
                            borderColor="$blue400"
                            overflow="hidden"
                        >
                            <Pressable
                                flex={1}
                                bg={isEnglish ? '$blue400' : '$white'}
                                py="$1.5"
                                alignItems="center"
                                onPress={() => handleChangeLang(LANGUAGE.EN)}
                            >
                                <Text
                                    color={isEnglish ? '$white' : '$blue400'}
                                    fontWeight="$medium"
                                >
                                    {'English'}
                                </Text>
                            </Pressable>
                            <Pressable
                                flex={1}
                                bg={!isEnglish ? '$blue400' : '$white'}
                                py="$1.5"
                                alignItems="center"
                                onPress={() => handleChangeLang(LANGUAGE.CN)}
                            >
                                <Text
                                    color={!isEnglish ? '$white' : '$blue400'}
                                    fontWeight="$medium"
                                >
                                    {'中文'}
                                </Text>
                            </Pressable>
                        </HStack>
                    </Box>
                    <Box py="$3" px="$2">
                        <Pressable onPress={() => setIsPasswordModalVisible(true)}>
                            <HStack alignItems="center" justifyContent="space-between">
                                <Text size="md" fontWeight="$medium" color="$textDark900" mb="$2">
                                    {getIntlText('common.label.change_password')}
                                </Text>
                                <MaterialIcons
                                    name="keyboard-arrow-right"
                                    size={24}
                                    color="$blue400"
                                />
                            </HStack>
                        </Pressable>
                    </Box>
                </VStack>
                {/* 编辑用户名 */}
                <Modal animationType="fade" transparent={true} visible={isVisible}>
                    <Box
                        flex={1}
                        justifyContent="center"
                        alignItems="center"
                        bg="rgba(0, 0, 0, 0.5)"
                    >
                        <Box width="80%" bg="$white" p="$4" borderRadius="$lg" alignItems="center">
                            <Text size="md" fontWeight="$medium" mb="$2" alignSelf="flex-start">
                                {getIntlText('common.label.username')}
                            </Text>
                            <TextInput
                                value={newNickname}
                                onChangeText={text => {
                                    setNewNickname(text);
                                    if (error) {
                                        setError('');
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: 10,
                                    borderColor: '#ccc',
                                    borderWidth: 1,
                                    borderRadius: 8,
                                    marginBottom: 20,
                                }}
                            />
                            {error ? (
                                <Text color="red" mb="$2">
                                    {error}
                                </Text>
                            ) : null}
                            <HStack space="md">
                                <Button onPress={() => setIsVisible(false)}>
                                    <ButtonText>{getIntlText('common.button.cancel')}</ButtonText>
                                </Button>
                                <Button onPress={handleSaveNickname}>
                                    <ButtonText>{getIntlText('common.button.save')}</ButtonText>
                                </Button>
                            </HStack>
                        </Box>
                    </Box>
                </Modal>

                {/* 修改密码弹窗 */}
                <Modal animationType="fade" transparent={true} visible={isPasswordModalVisible}>
                    <Box
                        flex={1}
                        justifyContent="center"
                        alignItems="center"
                        bg="rgba(0, 0, 0, 0.5)"
                    >
                        <Box width="80%" bg="$white" p="$4" borderRadius="$lg" alignItems="center">
                            <Text size="md" fontWeight="$medium" mb="$2" alignSelf="flex-start">
                                {getIntlText('common.label.change_password')}
                            </Text>

                            <Input mb="$4">
                                <InputField
                                    fontSize="$sm"
                                    control={false}
                                    placeholder={getIntlText('common.label.password')}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    // onSubmitEditing={handleKeyPress}
                                    returnKeyType="done"
                                    secureTextEntry={!showPassword}
                                    // type={showPassword ? 'text' : 'password'}
                                />
                                <InputSlot
                                    pr="$3"
                                    onPress={() => {
                                        setShowPassword(showConfirmState => {
                                            return !showConfirmState;
                                        });
                                    }}
                                >
                                    <InputIcon
                                        as={showPassword ? VisibilityOffIcon : VisibilityIcon}
                                    />
                                </InputSlot>
                            </Input>

                            <Input mb="$4">
                                <InputField
                                    control={false}
                                    fontSize="$sm"
                                    placeholder={getIntlText('common.label.confirm_password')}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                />
                                <InputSlot pr="$3" onPress={handleConfirmState}>
                                    <InputIcon
                                        as={
                                            showConfirmPassword ? VisibilityOffIcon : VisibilityIcon
                                        }
                                    />
                                </InputSlot>
                            </Input>
                            <HStack space="md">
                                <Button
                                    onPress={() => {
                                        setCurrentPassword('');
                                        setNewPassword('');
                                        setIsPasswordModalVisible(false);
                                    }}
                                >
                                    <ButtonText>{getIntlText('common.button.cancel')}</ButtonText>
                                </Button>
                                <Button onPress={handleChangePassword}>
                                    <ButtonText>{getIntlText('common.button.save')}</ButtonText>
                                </Button>
                            </HStack>
                        </Box>
                    </Box>
                </Modal>
            </ScrollView>

            {/* 底部退出按钮区域 */}
            <Box p="$6" bg="$white">
                <Button action="error" variant="outline" onPress={handleLogout}>
                    <ButtonText>{getIntlText('common.label.logout')}</ButtonText>
                </Button>
            </Box>
        </Box>
    );
}
