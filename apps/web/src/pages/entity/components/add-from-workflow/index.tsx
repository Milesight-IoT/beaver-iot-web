import { useRef } from 'react';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal, Form, UseFormItemsProps } from '@milesight/shared/src/components';
import { TableRowDataType } from '../../hooks/useColumns';

interface ConfigPluginProps {
    onCancel: () => void;
    onOk: (data: TableRowDataType) => void;
    data?: TableRowDataType | null;
}

const AddEntity = (props: ConfigPluginProps) => {
    const { getIntlText } = useI18n();
    const { onOk, onCancel, data } = props;
    const formRef = useRef<any>();

    // Initial form configuration
    const formItems: UseFormItemsProps[] = [
        {
            label: getIntlText('device.label.param_entity_name'),
            name: 'entityName',
            type: 'TextField',
            rules: {
                required: true,
                maxLength: {
                    value: 64,
                    message: '',
                },
            },
        },
        {
            label: getIntlText('common.label.workflow'),
            name: 'workflowId',
            type: 'Select',
            rules: {
                required: true,
            },
            props: {
                componentProps: {
                    fullWidth: true,
                },
                options: [
                    {
                        label: getIntlText('entity.label.entity_type_of_string'),
                        value: 'string',
                    },
                    {
                        label: getIntlText('entity.label.entity_type_of_int'),
                        value: 'int',
                    },
                    {
                        label: getIntlText('entity.label.entity_type_of_boolean'),
                        value: 'boolean',
                    },
                    {
                        label: getIntlText('entity.label.entity_type_of_enum'),
                        value: 'enum',
                    },
                ],
            },
        },
    ];

    const handleClose = () => {
        onCancel();
    };

    const handleOk = () => {
        formRef.current?.handleSubmit();
    };

    // Form submission
    const handleSubmit = (values: TableRowDataType) => {
        console.log(values);
        // onOk(values);
    };

    return (
        <Modal
            visible
            onCancel={handleClose}
            onOk={handleOk}
            onOkText={getIntlText('common.label.create')}
            title={getIntlText('entity.label.create_entity_from_workflow')}
            size="lg"
        >
            <Form<TableRowDataType> ref={formRef} formItems={formItems} onOk={handleSubmit} />
        </Modal>
    );
};

export default AddEntity;
