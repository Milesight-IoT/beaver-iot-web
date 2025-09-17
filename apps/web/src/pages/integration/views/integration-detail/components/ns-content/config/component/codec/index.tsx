import React, { useEffect } from 'react';
import { Alert } from '@mui/material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useMemoizedFn } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { toast, Modal } from '@milesight/shared/src/components';
import { awaitWrap, entityAPI, isRequestSuccess } from '@/services/http';
import { InteEntityType, useEntity } from '@/pages/integration/views/integration-detail/hooks';
import useFormItems, { FormDataProps } from './hook/useFormItems';

import './styles.less';

interface IProps {
    // visible
    visible: boolean;
    // Entity list/
    entities?: InteEntityType[];
    // cancel event
    onCancel: () => void;
    // codec update
    onUpdateSuccess?: () => void;
}

// codec repo entity key
const CODEC_REPO_KEY = 'model-repo-url';

// codec repo component
const CodecRepo: React.FC<IProps> = props => {
    const { visible, entities, onCancel, onUpdateSuccess } = props;
    const { getIntlText } = useI18n();
    const { getEntityKey, getEntityValue } = useEntity({ entities });

    useEffect(() => {
        const codecRepo = getEntityValue(CODEC_REPO_KEY);
        setValue('codecRepo', codecRepo || '');
    }, []);

    const onSubmit: SubmitHandler<FormDataProps> = useMemoizedFn(async (formData, all) => {
        const { codecRepo } = formData;
        const entityKey = getEntityKey(CODEC_REPO_KEY);
        if (!entityKey) {
            console.warn('Entity key is not found');
            return;
        }
        const [error, resp] = await awaitWrap(
            entityAPI.updateProperty({
                exchange: {
                    [entityKey]: codecRepo || '',
                },
            }),
        );
        if (error || !isRequestSuccess(resp)) {
            onUpdateSuccess?.();
            return;
        }
        toast.success({ content: getIntlText('common.message.operation_success') });
        onCancel();
        onUpdateSuccess?.();
    });

    // ---------- Render form items ----------
    const { control, handleSubmit, setValue } = useForm<FormDataProps>({
        shouldUnregister: true,
    });
    const formItems = useFormItems();

    return (
        <Modal
            size="lg"
            visible={visible}
            className="ms-gateway-codec-modal"
            title={getIntlText('setting.integration.label.codec_repo_title')}
            showCloseIcon
            onCancel={onCancel}
            onOk={handleSubmit(onSubmit)}
        >
            <div className="ms-gateway-codec-modal-tip">
                <Alert severity="info">
                    <div>{getIntlText('setting.integration.codec.customize_tip')}</div>
                </Alert>
            </div>
            <div className="ms-gateway-codec-modal-content">
                {formItems.map(({ shouldRender, ...props }) => {
                    return (
                        <Controller<FormDataProps> {...props} key={props.name} control={control} />
                    );
                })}
            </div>
        </Modal>
    );
};

export default CodecRepo;
