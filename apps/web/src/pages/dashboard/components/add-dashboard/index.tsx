import { useRef } from 'react';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal, Form } from '@milesight/shared/src/components';
import { DashboardDetail } from '@/services/http/dashboard';
import './style.less';

interface IProps {
    onCancel: () => void;
    onOk: (data: DashboardDetail) => void;
    data?: DashboardDetail;
}

const AddDashboard = (props: IProps) => {
    const { getIntlText } = useI18n();
    const { onOk, onCancel, data } = props;
    const formRef = useRef<any>();

    const formItems = [
        {
            label: getIntlText('dashboard.dashboard_name'),
            name: 'name',
            type: 'TextField',
            defaultValue: data?.name,
            rules: {
                required: true,
                maxLength: {
                    value: 64,
                    message: 'name is too long',
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

    const handleSubmit = (values: DashboardDetail) => {
        onOk(values);
    };

    return (
        <Modal
            visible
            onCancel={handleClose}
            onOk={handleOk}
            title={`${getIntlText(
                !data?.dashboard_id ? 'dashboard.add_title' : 'dashboard.edit_title',
            )}`}
            className="add-dashboard-modal"
        >
            <Form<DashboardDetail> ref={formRef} formItems={formItems} onOk={handleSubmit} />
        </Modal>
    );
};

export default AddDashboard;
