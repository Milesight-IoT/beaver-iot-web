import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { Paper, Typography, Button } from '@mui/material';
import cls from 'classnames';
import { useRequest } from 'ahooks';
import { oauthClientID, oauthClientSecret } from '@milesight/shared/src/config';
import { useI18n } from '@milesight/shared/src/hooks';
import { Logo } from '@milesight/shared/src/components';
import { iotLocalStorage, TOKEN_CACHE_KEY } from '@milesight/shared/src/utils/storage';
import { useUserStore } from '@/stores';
import { globalAPI, awaitWrap, isRequestSuccess, getResponseData } from '@/services/http';
import useFormItems, { type FormDataProps } from '../useFormItems';
import './style.less';

export default () => {
    const navigate = useNavigate();
    const { getIntlText } = useI18n();

    // ---------- 表单相关处理逻辑 ----------
    const { handleSubmit, control } = useForm<FormDataProps>();
    const formItems = useFormItems({ mode: 'login' });

    const onSubmit: SubmitHandler<FormDataProps> = async data => {
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

        navigate('/');
        iotLocalStorage.setItem(TOKEN_CACHE_KEY, result);
    };

    // ---------- 判断是否已登录 ----------
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
        <div className="ms-view-login">
            <Logo />
            <Paper
                className={cls('ms-auth-container', { hidden: loading !== false })}
                elevation={3}
            >
                <Typography variant="h5" align="center">
                    {getIntlText('common.document.title')}
                </Typography>
                <div className="ms-auth-form">
                    {formItems.map(props => (
                        <Controller<FormDataProps> key={props.name} {...props} control={control} />
                    ))}
                </div>
                <Button
                    fullWidth
                    sx={{ mt: 2.5, textTransform: 'none' }}
                    onClick={handleSubmit(onSubmit)}
                    variant="contained"
                >
                    {getIntlText('common.label.login')}
                </Button>
            </Paper>
        </div>
    );
};
