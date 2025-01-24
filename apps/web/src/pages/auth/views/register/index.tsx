import { useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cls from 'classnames';
import { useRequest } from 'ahooks';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { Paper, Typography, Button } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { Logo, toast } from '@milesight/shared/src/components';
import {
    iotLocalStorage,
    TOKEN_CACHE_KEY,
    REGISTERED_KEY,
} from '@milesight/shared/src/utils/storage';
import { globalAPI, awaitWrap, isRequestSuccess, getResponseData } from '@/services/http';
import useFormItems, { type FormDataProps } from '../useFormItems';
import './style.less';

export default () => {
    const navigate = useNavigate();

    // ---------- Register Judge ----------
    const [registered, setRegistered] = useState(false);
    const [loading, setLoading] = useState<boolean>();

    useRequest(
        async () => {
            setLoading(true);

            const [error, resp] = await awaitWrap(globalAPI.getUserStatus());

            setLoading(false);
            if (error || !isRequestSuccess(resp)) return;
            const isInit = !!getResponseData(resp)?.init;

            setRegistered(isInit);
            iotLocalStorage.setItem(REGISTERED_KEY, isInit);
        },
        {
            debounceWait: 300,
        },
    );

    // If you have registered an account, the login page is automatically redirected
    useLayoutEffect(() => {
        if (!registered) return;
        navigate('/auth/login', { replace: true });
    }, [registered, navigate]);

    // ---------- Form data processing ----------
    const { getIntlText } = useI18n();
    const { handleSubmit, control } = useForm<FormDataProps>();
    const formItems = useFormItems({ mode: 'register' });

    const onSubmit: SubmitHandler<FormDataProps> = async data => {
        const { email, username, password } = data;
        const [error, resp] = await awaitWrap(
            globalAPI.oauthRegister({
                email,
                nickname: username!,
                password,
            }),
        );

        // console.log({ error, resp });
        if (error || !isRequestSuccess(resp)) return;

        navigate('/auth/login');
        iotLocalStorage.setItem(REGISTERED_KEY, true);
        // Clear existing TOKEN data to prevent new users from logging in
        iotLocalStorage.removeItem(TOKEN_CACHE_KEY);
        toast.success(getIntlText('auth.message.register_success'));
    };

    return (
        <div className="ms-view-register">
            <Logo />
            <Paper
                className={cls('ms-auth-container', { hidden: loading !== false || registered })}
                elevation={3}
            >
                <Typography variant="h5" align="center">
                    {getIntlText('common.document.title')}
                </Typography>
                <Typography align="center" variant="body2" color="textSecondary">
                    {getIntlText('common.message.register_helper_text')}
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
                    {getIntlText('common.button.confirm')}
                </Button>
            </Paper>
        </div>
    );
};
