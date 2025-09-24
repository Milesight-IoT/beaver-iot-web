import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { Paper, Box } from '@mui/material';
import cls from 'classnames';
import { useRequest } from 'ahooks';
import { oauthClientID, oauthClientSecret } from '@milesight/shared/src/config';
import { useI18n } from '@milesight/shared/src/hooks';
import { Logo, LoadingButton } from '@milesight/shared/src/components';
import { iotLocalStorage, TOKEN_CACHE_KEY } from '@milesight/shared/src/utils/storage';
import { useUserStore } from '@/stores';
import { globalAPI, awaitWrap, isRequestSuccess, getResponseData } from '@/services/http';
import useFormItems, { type FormDataProps } from '../useFormItems';
import './style.less';

export default () => {
    const navigate = useNavigate();
    const { getIntlText } = useI18n();

    // ---------- form related processing logic ----------
    const { handleSubmit, control } = useForm<FormDataProps>();
    const formItems = useFormItems({ mode: 'login' });
    const [loginLoading, setLoginLoading] = useState<boolean>();

    const onSubmit: SubmitHandler<FormDataProps> = async data => {
        setLoginLoading(true);
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

        setLoginLoading(false);
        if (error || !respData || !isRequestSuccess(resp)) return;
        // The token is refreshed every 60 minutes
        const result = { ...respData, expires_in: Date.now() + 60 * 60 * 1000 };

        navigate('/');
        iotLocalStorage.setItem(TOKEN_CACHE_KEY, result);
    };

    // ---------- Check whether you are logged in ----------
    const setUserInfo = useUserStore(state => state.setUserInfo);
    const [loading, setLoading] = useState<boolean>();
    const token = iotLocalStorage.getItem(TOKEN_CACHE_KEY);
    useRequest(
        async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            setLoading(true);
            const [error, resp] = await awaitWrap(globalAPI.getUserInfo());
            setLoading(false);
            if (error || !isRequestSuccess(resp)) return;

            setUserInfo(getResponseData(resp));
            navigate('/', { replace: true });
        },
        { debounceWait: 300 },
    );

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} className="ms-view-login">
            <Paper
                className={cls('ms-auth-container', { hidden: loading !== false })}
                elevation={3}
            >
                <div className="ms-auth-logo">
                    <Logo />
                </div>
                <div className="ms-auth-form">
                    {formItems.map(props => (
                        <Controller<FormDataProps> key={props.name} {...props} control={control} />
                    ))}
                </div>
                <LoadingButton
                    fullWidth
                    type="submit"
                    loading={loginLoading}
                    sx={{ textTransform: 'none' }}
                    variant="contained"
                    className="ms-auth-submit"
                >
                    {getIntlText('common.label.login')}
                </LoadingButton>
            </Paper>
        </Box>
    );
};
