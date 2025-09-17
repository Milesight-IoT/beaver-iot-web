/* eslint-disable camelcase */
import React, { useState } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { Alert, DialogActions, Button } from '@mui/material';
import { useMemoizedFn } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { LoadingButton, toast } from '@milesight/shared/src/components';
import { awaitWrap, isRequestSuccess, embeddedNSApi } from '@/services/http';
import useFormItems, { ApplicationPropsType, ApplicationType } from './hook/useFormItems';

// add gateway select application id
const Application: React.FC<ApplicationPropsType> = props => {
    const {
        eui,
        name,
        credential_id,
        application_id,
        client_id,
        applicationOptions,
        onBack,
        onSuccess,
    } = props;

    const { getIntlText } = useI18n();
    const [loading, setLoading] = useState<boolean>(false);

    // ---------- Render form items ----------
    const { control, handleSubmit, trigger, getValues } = useForm<ApplicationType>({
        shouldUnregister: true,
        defaultValues: {
            application_id,
        },
    });

    const formItems = useFormItems({ applicationOptions });

    // back step
    const handleBackStep = async () => {
        const applicationConfig = getValues();
        onBack(applicationConfig);
    };

    // confirm add gateway
    const handleConfirm: SubmitHandler<ApplicationType> = useMemoizedFn(async (formData, all) => {
        const { application_id } = formData;
        setLoading(true);
        const [error, resp] = await awaitWrap(
            embeddedNSApi.addGateway({
                eui,
                name: name?.trim(),
                credential_id,
                client_id,
                application_id,
            }),
        );
        setLoading(false);
        if (error || !isRequestSuccess(resp)) {
            return;
        }
        toast.success(getIntlText('common.message.add_success'));
        onSuccess();
    });

    return (
        <div>
            <div className="ms-ns-add-modal-tip">
                <Alert severity="warning">
                    <div>{getIntlText('setting.integration.add.application_tip')}</div>
                </Alert>
            </div>
            <div className="ms-view-gateway-info">
                {formItems.map(({ shouldRender, ...props }) => {
                    return (
                        <Controller<ApplicationType>
                            {...props}
                            key={props.name}
                            control={control}
                        />
                    );
                })}
            </div>
            <DialogActions>
                <Button
                    variant="outlined"
                    sx={{ height: 36, textTransform: 'none' }}
                    onClick={handleBackStep}
                >
                    {getIntlText('common.button.previous')}
                </Button>
                <LoadingButton
                    variant="contained"
                    loading={loading}
                    onClick={handleSubmit(handleConfirm)}
                    sx={{ height: 36 }}
                >
                    {getIntlText('common.button.confirm')}
                </LoadingButton>
            </DialogActions>
        </div>
    );
};

export default Application;
