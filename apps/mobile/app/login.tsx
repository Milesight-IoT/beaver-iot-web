import { SafeAreaView, Keyboard } from 'react-native';
import React, { useState } from 'react';
import {
    Button,
    ButtonText,
    FormControl,
    Input,
    VStack,
    Box,
    InputField,
    FormControlError,
    FormControlErrorIcon,
    FormControlErrorText,
    InputIcon,
    InputSlot,
    Image,
    VisibilityOffIcon,
    VisibilityIcon,
    WarningIcon,
} from '@ms-mobile-ui/themed';
import { useForm, Controller } from 'react-hook-form';
import { router } from 'expo-router';
import useI18n from '@milesight/shared/src/hooks/useI18n';
import { checkRequired, checkEmail } from '@milesight/shared/src/utils/validators';

import {
    globalAPI,
    awaitWrap,
    isRequestSuccess,
    getResponseData,
    oauthClientID,
    oauthClientSecret,
} from '@/services/http';
import { useSession } from '@/hooks';

interface LoginData {
    email: string;
    password: string;
}

const Login = () => {
    const {
        control,
        formState: { errors },
        handleSubmit,
    } = useForm<LoginData>();
    const { getIntlText } = useI18n();
    const { login } = useSession();
    const [isEmailFocused] = useState(false);

    const onSubmit = async (data: LoginData) => {
        const { email, password } = data;
        const [error, resp] = await awaitWrap(
            globalAPI.oauthLogin({
                grant_type: 'password',
                username: email,
                password,
                client_id: oauthClientID,
                client_secret: oauthClientSecret,
            }),
        );
        const respData = getResponseData(resp);

        // console.log({ error, resp });
        if (error || !respData || !isRequestSuccess(resp)) return;
        // 每 60 分钟刷新一次 token
        const result = { ...respData, expires_in: Date.now() + 60 * 60 * 1000 };

        login(result);
        router.replace('/(home)');
    };

    const handleKeyPress = () => {
        Keyboard.dismiss();
        handleSubmit(onSubmit)();
    };

    const [showPassword, setShowPassword] = useState(false);

    const handleState = () => {
        setShowPassword(showState => {
            return !showState;
        });
    };

    const handleRegister = () => {
        router.push('/register');
    };

    return (
        <SafeAreaView>
            <Box
                $dark-bg="$backgroundDark800"
                $web-height="100vh"
                $web-w="100vw"
                $web-overflow="hidden"
                height="$full"
                bg="$backgroundLight0"
            >
                <Box
                    p="$4"
                    flex={1}
                    maxWidth="$96"
                    alignSelf="center"
                    justifyContent="center"
                    w="$full"
                >
                    <Image
                        source={require('../assets/images/splash-icon.png')}
                        alt="logo"
                        width={200}
                        height={50}
                        resizeMode="contain"
                        alignSelf="center"
                        marginBottom={30}
                    />
                    <VStack justifyContent="space-between">
                        <FormControl
                            isInvalid={(!!errors.email || isEmailFocused) && !!errors.email}
                            isRequired={true}
                        >
                            <Controller
                                name="email"
                                defaultValue=""
                                control={control}
                                rules={{
                                    validate: {
                                        checkRequired: checkRequired(),
                                        checkEmail: checkEmail(),
                                    },
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input>
                                        <InputField
                                            control={false}
                                            fontSize="$sm"
                                            placeholder={getIntlText('common.label.email')}
                                            type="text"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            onSubmitEditing={handleKeyPress}
                                            returnKeyType="done"
                                        />
                                    </Input>
                                )}
                            />
                            <FormControlError>
                                <FormControlErrorIcon as={WarningIcon} size="xs" />
                                <FormControlErrorText>
                                    {errors?.email?.message?.toString()}
                                </FormControlErrorText>
                            </FormControlError>
                        </FormControl>

                        <FormControl isInvalid={!!errors.password} isRequired={true} my="$6">
                            <Controller
                                name="password"
                                defaultValue=""
                                control={control}
                                rules={{
                                    validate: {
                                        checkRequired: checkRequired(),
                                    },
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input>
                                        <InputField
                                            fontSize="$sm"
                                            control={false}
                                            placeholder={getIntlText('common.label.password')}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            onSubmitEditing={handleKeyPress}
                                            returnKeyType="done"
                                            type={showPassword ? 'text' : 'password'}
                                        />
                                        <InputSlot onPress={handleState} pr="$3">
                                            <InputIcon
                                                as={
                                                    showPassword
                                                        ? VisibilityIcon
                                                        : VisibilityOffIcon
                                                }
                                            />
                                        </InputSlot>
                                    </Input>
                                )}
                            />
                            <FormControlError>
                                <FormControlErrorIcon as={WarningIcon} size="xs" />
                                <FormControlErrorText>
                                    {errors?.password?.message?.toString()}
                                </FormControlErrorText>
                            </FormControlError>
                        </FormControl>
                    </VStack>
                    <VStack space="md">
                        <Button variant="solid" size="lg" onPress={handleSubmit(onSubmit)}>
                            <ButtonText fontSize="$sm">
                                {getIntlText('common.label.login')}
                            </ButtonText>
                        </Button>
                        <Button variant="outline" size="lg" onPress={handleRegister}>
                            <ButtonText fontSize="$sm">
                                {getIntlText('common.label.register')}
                            </ButtonText>
                        </Button>
                    </VStack>
                </Box>
            </Box>
        </SafeAreaView>
    );
};

export default Login;
