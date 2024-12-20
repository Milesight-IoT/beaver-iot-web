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
            label: getIntlText('dashboard.dashboard_name'),
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
            visible
            onCancel={handleClose}
            onOk={handleOk}
            title={getIntlText('common.label.edit')}
        >
            <Form<{ entityName: string }> ref={formRef} formItems={formItems} onOk={handleSubmit} />
        </Modal>
    );
};

export default EditEntity;
