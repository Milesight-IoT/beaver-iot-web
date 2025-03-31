import React, { useState } from 'react';
import { Button, DialogActions } from '@mui/material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useMemoizedFn } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { LoadingButton } from '@milesight/shared/src/components';
import { awaitWrap, isRequestSuccess, embeddedNSApi } from '@/services/http';
import useFormItems, { GatewayBasicType } from './hook/useFormItems';

interface IProps {
    data: GatewayBasicType | null;
    onCancel: () => void;
    onNext: (value: GatewayBasicType) => void;
}

export type { GatewayBasicType };

// add gateway  basic info
const GatewayBasic: React.FC<IProps> = props => {
    const { data, onCancel, onNext } = props;
    const { getIntlText } = useI18n();
    const [loading, setLoading] = useState<boolean>(false);

    const handleNextStep: SubmitHandler<GatewayBasicType> = useMemoizedFn(async (formData, all) => {
        const { eui } = formData;
        setLoading(true);
        const [err, resp] = await awaitWrap(
            embeddedNSApi.validateGateway({
                eui,
            }),
        );
        setLoading(false);
        if (err || !isRequestSuccess(resp)) {
            return;
        }
        onNext(formData);
    });

    // ---------- Render form items ----------
    const { control, handleSubmit, getValues, trigger } = useForm<GatewayBasicType>({
        shouldUnregister: true,
        defaultValues: {
            name: data?.name,
            eui: data?.eui,
        },
    });
    const formItems = useFormItems();

    return (
        <div className="ms-ns-add-modal-content">
            {formItems.map(({ shouldRender, ...props }) => {
                return (
                    <Controller<GatewayBasicType> {...props} key={props.name} control={control} />
                );
            })}
            <DialogActions>
                <Button
                    variant="outlined"
                    sx={{ height: 36, textTransform: 'none' }}
                    onClick={onCancel}
                >
                    {getIntlText('common.button.cancel')}
                </Button>
                <LoadingButton
                    variant="contained"
                    loading={loading}
                    onClick={handleSubmit(handleNextStep)}
                    sx={{ height: 36 }}
                >
                    {getIntlText('common.button.next')}
                </LoadingButton>
            </DialogActions>
        </div>
    );
};

export default GatewayBasic;
