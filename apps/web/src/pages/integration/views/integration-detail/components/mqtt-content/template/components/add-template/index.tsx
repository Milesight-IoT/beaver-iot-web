import React, { useEffect, useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useMemoizedFn } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { toast, Modal } from '@milesight/shared/src/components';
import {
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    mqttApi,
    MqttBrokerInfoType,
    TemplateType,
    DEFAULT_DEVICE_OFFLINE_TIMEOUT,
} from '@/services/http';
import { InteEntityType } from '../../../../../hooks';
import { useFormItems, type FormDataProps } from './hook';

interface IProps {
    // visible
    visible: boolean;
    template: ObjectToCamelCase<TemplateType> | undefined;
    // Entity list/
    entities?: InteEntityType[];
    brokerInfo?: MqttBrokerInfoType;
    // cancel event
    onCancel: () => void;
    refreshTable?: () => void;
}

// add template component
const AddTemplate: React.FC<IProps> = props => {
    const { visible, template, brokerInfo, onCancel, refreshTable } = props;
    const [prefixTopic, setPrefixTopic] = useState<string>('');
    const { getIntlText } = useI18n();

    useEffect(() => {
        setPrefixTopic(brokerInfo?.topic_prefix || '');
    }, [brokerInfo]);

    useEffect(() => {
        if (template) {
            // Edit
            setValue('name', template.name);
            setValue('topic', template.topic);
            setValue('yaml', template.content);
            setValue('description', template.description);
            setValue('timeout', template.deviceOfflineTimeout);
        } else {
            // Add
            setValue('timeout', DEFAULT_DEVICE_OFFLINE_TIMEOUT);
            getDefaultTemplateYaml();
        }
    }, []);

    const getDefaultTemplateYaml = async () => {
        const [error, resp] = await awaitWrap(mqttApi.getDefaultTemplate());
        const data = getResponseData(resp);
        if (error || !data || !isRequestSuccess(resp)) {
            return;
        }
        setValue('yaml', data.content);
    };

    const onSubmit: SubmitHandler<FormDataProps> = useMemoizedFn(async formData => {
        const { name, topic, description, yaml, timeout } = formData;

        const [error, resp] = await awaitWrap(
            mqttApi.checkTemplate({
                content: yaml,
            }),
        );
        if (error || !isRequestSuccess(resp)) {
            setError('yaml', { message: (error?.response?.data as any)?.error_message });
            return;
        }
        const params = {
            id: template?.id,
            name,
            topic,
            description,
            content: yaml,
            device_offline_timeout: timeout,
        };
        if (!template) {
            delete params.id;
        }
        const [err, res] = await awaitWrap(
            mqttApi[template?.id ? 'updateTemplate' : 'addTemplate'](params),
        );
        if (err || !isRequestSuccess(res)) {
            return;
        }
        toast.success({ content: getIntlText('common.message.operation_success') });
        onCancel();
        refreshTable?.();
    });

    // ---------- Render form items ----------
    const { control, handleSubmit, setValue, setError } = useForm<FormDataProps>({
        shouldUnregister: true,
    });
    const formItems = useFormItems({
        prefixTopic,
    });

    return (
        <Modal
            size="lg"
            visible={visible}
            className="ms-view-mqtt-template-add"
            title={
                template
                    ? getIntlText('setting.integration.edit_device_template')
                    : getIntlText('setting.integration.add_device_template')
            }
            showCloseIcon
            onCancel={onCancel}
            onOk={handleSubmit(onSubmit)}
        >
            <div className="ms-view-mqtt-template-add-content">
                {formItems.map(({ ...props }) => {
                    return (
                        <Controller<FormDataProps> {...props} key={props.name} control={control} />
                    );
                })}
            </div>
        </Modal>
    );
};

export default AddTemplate;
