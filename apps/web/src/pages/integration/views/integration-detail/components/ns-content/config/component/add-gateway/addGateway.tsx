import React, { useState } from 'react';
import { Step, StepButton, Stepper } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal } from '@milesight/shared/src/components';
import { DeviceListAppItem, MqttCredentialBrokerType } from '@/services/http/embedded-ns';
import GatewayMqttInfo, { type MqttValidateResultType } from '../gateway-mqtt/gatewayMqttInfo';
import GatewayBasic, { GatewayBasicType } from './component/basic';
import { ApplicationType } from './component/application/hook/useFormItems';
import Application from './component/application';

import './style.less';

interface IProps {
    visible: boolean;
    refreshTable: () => void;
    onCancel: () => void;
    onUpdateSuccess?: () => void;
}

// add gateway component
const AddGateway: React.FC<IProps> = props => {
    const { visible, refreshTable, onCancel, onUpdateSuccess } = props;
    const { getIntlText } = useI18n();

    // current step
    const [activeStep, setActiveStep] = useState<number>(0);
    const [basicInfo, setBasicInfo] = useState<GatewayBasicType | null>(null);
    const [mqttData, setMqttData] = useState<MqttCredentialBrokerType | null>(null);
    const [applicationInfo, setApplicationInfo] = useState<ApplicationType | null>(null);
    const [applicationOptions, setApplicationOptions] = useState<DeviceListAppItem[]>([]);

    // basic info next event
    const handleBasicNext = (basicInfo: GatewayBasicType) => {
        setBasicInfo(basicInfo);
        handleNextStep();
    };

    // mqtt info back event
    const handleMqttBack = (mqttConfig: MqttCredentialBrokerType) => {
        setMqttData(mqttConfig);
        handleBackStep();
    };

    // mqtt info next event
    const handleMqttNext = (data: MqttValidateResultType) => {
        const { mqttConfig, applicationOptions } = data;
        setMqttData(mqttConfig);
        setApplicationOptions(applicationOptions);
        handleNextStep();
    };

    // select app info back event
    const handleAppBack = (applicationConfig: ApplicationType) => {
        setApplicationInfo(applicationConfig);
        handleBackStep();
    };

    // select app info confirm event
    const handleAppSuccess = () => {
        onCancel();
        refreshTable();
        onUpdateSuccess?.();
    };

    // step component
    const stepComponentList = [
        {
            label: getIntlText('setting.integration.label.add_gateway'),
            component: (
                <GatewayBasic data={basicInfo} onCancel={onCancel} onNext={handleBasicNext} />
            ),
        },
        {
            label: getIntlText('setting.integration.label.setup_app'),
            component: (
                <GatewayMqttInfo
                    eui={basicInfo?.eui}
                    mqttConfig={mqttData}
                    onBack={handleMqttBack}
                    onNext={handleMqttNext}
                />
            ),
        },
        {
            label: getIntlText('setting.integration.label.choose_app'),
            component: (
                <Application
                    applicationOptions={applicationOptions}
                    eui={basicInfo?.eui}
                    name={basicInfo?.name}
                    credential_id={mqttData?.credential_id}
                    application_id={applicationInfo?.application_id}
                    client_id={mqttData?.client_id}
                    onBack={handleAppBack}
                    onSuccess={handleAppSuccess}
                />
            ),
        },
    ];

    const handleBackStep = () => {
        setActiveStep(prevActiveStep => prevActiveStep - 1);
    };

    const handleNextStep = () => {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
    };

    const handleStep = (step: number) => () => {
        setActiveStep(step);
    };

    return (
        <Modal
            size="lg"
            visible={visible}
            className="ms-gateway-modal"
            title={getIntlText('setting.integration.label.add_gateway')}
            showCloseIcon
            onCancel={onCancel}
            footer={null}
        >
            <div className="ms-ns-add-modal">
                <div className="ms-ns-add-modal-stepper">
                    <Stepper nonLinear activeStep={activeStep}>
                        {stepComponentList.map(({ label }, index) => (
                            <Step key={label} completed={activeStep >= index}>
                                <StepButton disabled color="contained" onClick={handleStep(index)}>
                                    {label}
                                </StepButton>
                            </Step>
                        ))}
                    </Stepper>
                </div>
                {stepComponentList[activeStep].component}
            </div>
        </Modal>
    );
};

export default AddGateway;
