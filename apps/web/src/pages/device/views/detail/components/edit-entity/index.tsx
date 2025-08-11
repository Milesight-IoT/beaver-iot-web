import { useRef } from 'react';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal, Form } from '@milesight/shared/src/components';
import { DeviceAPISchema } from '@/services/http';

interface IProps {
    onCancel: () => void;
    onOk: (entityName: string) => void;
    data?: ObjectToCamelCase<DeviceAPISchema['getDetail']['response']['entities'][0]>;
}

const EditEntity = (props: IProps) => {
    const { getIntlText } = useI18n();
    const { onOk, onCancel, data } = props;
    const formRef = useRef<any>();

    const formItems = [
        {
            label: getIntlText('device.label.param_entity_name'),
            name: 'entityName',
            type: 'TextField',
            defaultValue: data?.name,
            rules: {
                required: true,
                maxLength: {
                    value: 64,
                    message: '',
                },
            },
        },
    ];

    const handleClose = () => {
        onCancel();
    };

    const handleOk = () => {
        formRef.current?.handleSubmit();
    };

    const handleSubmit = (values: { entityName: string }) => {
        onOk(values.entityName);
    };

    return (
        <Modal
            size="lg"
            visible
            onCancel={handleClose}
            onOk={handleOk}
            title={getIntlText('common.button.edit')}
        >
            <Form<{ entityName: string }> ref={formRef} formItems={formItems} onOk={handleSubmit} />
        </Modal>
    );
};

export default EditEntity;
