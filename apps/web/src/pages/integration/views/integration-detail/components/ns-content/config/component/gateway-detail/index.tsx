import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal } from '@milesight/shared/src/components';
import GatewayMqttInfo from '../gateway-mqtt/gatewayMqttInfo.tsx';
import { TableRowDataType } from '../../hook/useColumn.tsx';

import './style.less';

interface Props {
    visible: boolean;
    gatewayInfo: TableRowDataType | null;
    onCancel: () => void;
}

// gateway mqtt config detail
const GatewayDetail: React.FC<Props> = props => {
    const { visible, gatewayInfo, onCancel } = props;
    const { getIntlText } = useI18n();

    return (
        <Modal
            size="xl"
            visible={visible}
            className="ms-gateway-modal"
            title={getIntlText('setting.integration.label.config_info')}
            footer={null}
            showCloseIcon
            onCancel={onCancel}
        >
            <GatewayMqttInfo eui={gatewayInfo?.eui} showTip={false} />
        </Modal>
    );
};

export default GatewayDetail;
