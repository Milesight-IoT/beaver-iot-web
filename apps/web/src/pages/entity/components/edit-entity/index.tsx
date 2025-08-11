import { useRef } from 'react';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal, Form } from '@milesight/shared/src/components';
import { TableRowDataType } from '../../hooks';

interface IProps {
    onCancel: () => void;
    onOk: (entityName: string) => void;
    data?: TableRowDataType;
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
            defaultValue: data?.entityName,
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
            className="entity-edit-modal"
            title={getIntlText('common.button.edit')}
        >
            <Form<{ entityName: string }> ref={formRef} formItems={formItems} onOk={handleSubmit} />
        </Modal>
    );
};

export default EditEntity;
