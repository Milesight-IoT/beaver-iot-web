import { TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import {
    Button,
    ButtonText,
    FormControl,
    Input,
    VStack,
    Box,
    Text,
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
import { Header } from '@react-navigation/elements';
import {
    iotLocalStorage,
    TOKEN_CACHE_KEY,
    REGISTERED_KEY,
} from '@milesight/shared/src/utils/storage';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { router } from 'expo-router';
import useI18n from '@milesight/shared/src/hooks/useI18n';
import {
    checkRequired,
    checkEmail,
    userNameChecker,
    passwordChecker,
} from '@milesight/shared/src/utils/validators';
import Ionicons from '@expo/vector-icons/Ionicons';
import { globalAPI, awaitWrap, isRequestSuccess, getResponseData } from '@/services/http';

interface FormDataProps {
    email: string;
    code: string;
    password: string;
    username?: string;
    confirmPassword?: string;
}

const Register = () => {
    const { getIntlText } = useI18n();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [timer, setTimer] = useState(0);
    const [codeIdentity, setCodeIdentity] = useState<string>('');

    const {
        control,
        formState: { errors },
        getValues,
        setError,
        handleSubmit,
    } = useForm<FormDataProps>();

    const onSubmit: SubmitHandler<FormDataProps> = useCallback(
        async data => {
            console.log('======onSubmit======', data);

            const { email, username, password, code } = data;
            const [error, resp] = await awaitWrap(
                globalAPI.oauthRegister({
                    email,
                    nickname: username!,
                    password,
                    verificationCode: code,
                    codeIdentity,
                }),
            );

            if (error || !isRequestSuccess(resp)) {
                console.log('onSubmit error', JSON.stringify(error));
                return;
            };

            iotLocalStorage.setItem(REGISTERED_KEY, true);
            // 清除已有的 TOKEN 数据，避免影响新用户登录
            iotLocalStorage.removeItem(TOKEN_CACHE_KEY);

            router.replace('/login');
        },
        [codeIdentity],
    );

    const handleState = () => {
        setShowPassword(showState => {
            return !showState;
        });
    };

    const handleConfirmState = () => {
        setShowConfirmPassword(showConfirmState => {
            return !showConfirmState;
        });
    };

    const sendVerificationCode = async () => {
        const email = getValues('email');
        // 发送验证码的逻辑
        console.log('发送验证码');
        // 获取表单邮箱数据
        if (!email) {
            setError('email', {
                type: 'manual',
                message: getIntlText('valid.input.required'),
            });
            return;
        }
        const emailReg =
            /^\w+((-\w+)|(\.\w+)|(\+\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.([A-Za-z0-9]+)$/;
        if (!emailReg.test(email)) {
            setError('email', {
                type: 'manual',
                message: getIntlText('valid.input.email'),
            });
            return;
        }
        const [error, resp] = await awaitWrap(
            globalAPI.oauthRegisterCode({
                email,
            }),
        );
        console.log('resp: ', resp);
        console.log('error: ', error);

        if (resp && resp.data) {
            const data = getResponseData(resp) || {};
            setCodeIdentity(data as string);
            // 启动计时器
            setIsSendingCode(true);
            setTimer(60);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isSendingCode && timer > 0) {
            interval = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsSendingCode(false);
            if (interval) {
                clearInterval(interval);
            }
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isSendingCode, timer]);

    return (
        <Box
            $dark-bg="$backgroundDark800"
            $web-height="100vh"
            $web-w="100vw"
            $web-overflow="hidden"
            height="$full"
            bg="$backgroundLight0"
        >
            <Header
                title={getIntlText('common.label.register')}
                headerLeft={() => (
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingLeft: 16,
                            gap: 2,
                        }}
                        onPress={() => router.replace('/login')}
                    >
                        <Ionicons name="chevron-back" size={24} color="#666" />
                    </TouchableOpacity>
                )}
                headerStyle={{
                    backgroundColor: 'white'
                }}
                headerTitleStyle={{
                    fontSize: 17,
                    fontWeight: '600'
                }}
            />
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
                <VStack justifyContent="space-between" space="md">
                    <FormControl isInvalid={!!errors.email} isRequired={true}>
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

                    {/* 验证码 */}
                    <FormControl isInvalid={!!errors.code} isRequired={true}>
                        <Controller
                            name="code"
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
                                        control={false}
                                        fontSize="$sm"
                                        placeholder={getIntlText('common.label.code')}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                    <InputSlot pr="$3">
                                        <Button
                                            onPress={sendVerificationCode}
                                            variant="outline"
                                            size="sm"
                                            disabled={isSendingCode}
                                        >
                                            <ButtonText>
                                                {isSendingCode
                                                    ? `${timer}s`
                                                    : getIntlText('common.label.send_code')}
                                            </ButtonText>
                                        </Button>
                                    </InputSlot>
                                </Input>
                            )}
                        />
                        <FormControlError>
                            <FormControlErrorIcon as={WarningIcon} size="xs" />
                            <FormControlErrorText>
                                {errors?.code?.message?.toString()}
                            </FormControlErrorText>
                        </FormControlError>
                    </FormControl>

                    {/* 用户名 */}
                    <FormControl isInvalid={!!errors.username} isRequired={true}>
                        <Controller
                            name="username"
                            defaultValue=""
                            control={control}
                            rules={{
                                validate: {
                                    checkRequired: checkRequired(),
                                    ...userNameChecker(),
                                },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input>
                                    <InputField
                                        control={false}
                                        fontSize="$sm"
                                        placeholder={getIntlText('common.label.username')}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                </Input>
                            )}
                        />
                        <FormControlError>
                            <FormControlErrorIcon as={WarningIcon} size="xs" />
                            <FormControlErrorText>
                                {errors?.username?.message?.toString()}
                            </FormControlErrorText>
                        </FormControlError>
                    </FormControl>

                    {/* 密码 */}
                    <FormControl isInvalid={!!errors.password} isRequired={true}>
                        <Controller
                            name="password"
                            defaultValue=""
                            control={control}
                            rules={{
                                validate: {
                                    checkRequired: checkRequired(),
                                    ...passwordChecker(),
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
                                        // onSubmitEditing={handleKeyPress}
                                        returnKeyType="done"
                                        secureTextEntry={!showPassword}
                                        // type={showPassword ? 'text' : 'password'}
                                    />
                                    <InputSlot pr="$3" onPress={handleState}>
                                        <InputIcon
                                            as={
                                                showPassword
                                                    ? VisibilityOffIcon
                                                    : VisibilityIcon
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

                    {/* 确认密码 */}
                    <FormControl isInvalid={!!errors.confirmPassword} isRequired={true}>
                        <Controller
                            name="confirmPassword"
                            defaultValue=""
                            control={control}
                            rules={{
                                validate: {
                                    checkRequired: checkRequired(),
                                    checkSamePassword: (value, formValues) => {
                                        if (value !== formValues.password) {
                                            return getIntlText('valid.input.password.diff');
                                        }
                                        return true;
                                    },
                                },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input>
                                    <InputField
                                        control={false}
                                        fontSize="$sm"
                                        placeholder={getIntlText(
                                            'common.label.confirm_password',
                                        )}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                    <InputSlot pr="$3" onPress={handleConfirmState}>
                                        <InputIcon
                                            as={
                                                showConfirmPassword
                                                    ? VisibilityOffIcon
                                                    : VisibilityIcon
                                            }
                                        />
                                    </InputSlot>
                                </Input>
                            )}
                        />
                        <FormControlError>
                            <FormControlErrorIcon as={WarningIcon} size="xs" />
                            <FormControlErrorText>
                                {errors?.confirmPassword?.message?.toString()}
                            </FormControlErrorText>
                        </FormControlError>
                    </FormControl>
                </VStack>
                <Button variant="solid" size="lg" mt="$6" onPress={handleSubmit(onSubmit)}>
                    <ButtonText fontSize="$sm">
                        {getIntlText('common.label.register')}
                    </ButtonText>
                </Button>
            </Box>
        </Box>
    );
};

export default Register;
