import React, { useEffect, useState } from 'react';
import { useMemoizedFn } from 'ahooks';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useI18n } from '@milesight/shared/src/hooks';
import { delay, objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { toast, Modal, LoadingButton } from '@milesight/shared/src/components';
import { Empty } from '@/components';
import {
    awaitWrap,
    DataReportResult,
    getResponseData,
    isRequestSuccess,
    mqttApi,
    TemplateDetailType,
} from '@/services/http';
import { FormDataProps, useFormItems, useTemplateData } from './hook';
import { ParseResult } from './components';

import './style.less';

interface IProps {
    // visible
    visible: boolean;
    templateDetail: ObjectToCamelCase<TemplateDetailType>;
    // cancel event
    onCancel: () => void;
    refreshTable?: () => void;
}

// test template data component
const TestTemplate: React.FC<IProps> = props => {
    const { visible, templateDetail, onCancel, refreshTable } = props;

    const { getIntlText } = useI18n();
    const { randomJsonByInputSchema, checkInputJsonFormat } = useTemplateData();
    const [simulatedDataLoading, setSimulatedDataLoading] = useState<boolean>(false);
    const [dataLoading, setDataLoading] = useState<boolean>(false);
    const [reportResult, setReportResult] = useState<
        ObjectToCamelCase<DataReportResult> | undefined
    >();

    const genSimulatedData = async () => {
        setSimulatedDataLoading(true);
        await delay(50);
        const inputParams = randomJsonByInputSchema(templateDetail);
        setValue('data', JSON.stringify(inputParams, null, 2));
        setSimulatedDataLoading(false);
    };

    const handleDataReport: SubmitHandler<FormDataProps> = useMemoizedFn(async formData => {
        const result = checkInputJsonFormat(JSON.parse(formData.data), templateDetail);
        if (result && typeof result === 'string') {
            setError('data', { message: result });
            return;
        }
        setDataLoading(true);
        const [error, resp] = await awaitWrap(
            mqttApi.testTemplate({
                id: templateDetail.id,
                test_data: formData.data,
            }),
        );
        const data = getResponseData(resp);
        setDataLoading(false);
        if (error || !data || !isRequestSuccess(resp)) {
            setError('data', {
                message: (error?.response?.data as any)?.error_message,
            });
            setReportResult(undefined);
            return;
        }
        setReportResult(objectToCamelCase(data));
        refreshTable?.();
        toast.success(getIntlText('common.message.operation_success'));
    });

    // ---------- Render form items ----------
    const { control, handleSubmit, setValue, watch, setError } = useForm<FormDataProps>({
        shouldUnregister: true,
    });
    const formItems = useFormItems({
        simulatedDataLoading,
        genSimulatedData,
    });
    const simulatedData = watch('data');

    return (
        <Modal
            size="xl"
            visible={visible}
            className="ms-view-mqtt-template-test"
            title={getIntlText('setting.integration.test_data')}
            showCloseIcon
            onCancel={onCancel}
            footer={null}
        >
            <div className="ms-view-mqtt-template-test-content">
                <div>
                    {formItems.map(({ ...props }) => {
                        return (
                            <Controller<FormDataProps>
                                {...props}
                                key={props.name}
                                control={control}
                            />
                        );
                    })}
                    <LoadingButton
                        loading={dataLoading}
                        disabled={!simulatedData}
                        variant="contained"
                        onClick={handleSubmit(handleDataReport)}
                    >
                        {getIntlText('setting.integration.data_report')}
                    </LoadingButton>
                </div>
                <div>
                    {reportResult ? (
                        <ParseResult
                            title={getIntlText('setting.integration.parse_result')}
                            entityList={reportResult?.entities}
                        />
                    ) : (
                        <Empty
                            text={getIntlText('setting.integration.simulated_data_report_tip')}
                        />
                    )}
                    {!!reportResult && (
                        <LoadingButton variant="contained" onClick={onCancel}>
                            {getIntlText('common.button.confirm')}
                        </LoadingButton>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default TestTemplate;
