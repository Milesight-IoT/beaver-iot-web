import { useRef, useState, useEffect, Suspense } from 'react';
import { Tabs, Tab, DialogActions, Button } from '@mui/material';
import { Modal, JsonView, LoadingButton } from '@milesight/shared/src/components';
import { useI18n } from '@milesight/shared/src/hooks';
import { TabPanel } from '@/components';
import { RenderConfig, RenderView } from '../render';
import plugins from '../plugins';
import './style.less';

interface ConfigPluginProps {
    config: CustomComponentProps;
    onClose: () => void;
    onOk?: (data: any) => void;
    onChange?: (data: any) => void;
    title?: string;
}

const ConfigPlugin = (props: ConfigPluginProps) => {
    const { getIntlText } = useI18n();
    const { config, onClose, onOk, onChange, title } = props;
    const ComponentConfig = (plugins as any)[`${config.type}Config`];
    const ComponentView = (plugins as any)[`${config.type}View`];
    const formRef = useRef<any>();
    const [formValues, setFormValues] = useState<any>({});
    const [tabKey, setTabKey] = useState<string>('basic');

    const handleClose = () => {
        onClose();
    };

    const handleChange = (values: any) => {
        const curFormValues = { ...formValues };
        Object.keys(values).forEach((key: string) => {
            if (values[key] !== undefined) {
                curFormValues[key] = values[key];
            }
        });
        if (curFormValues && Object.keys(curFormValues)?.length) {
            setFormValues(curFormValues);
            onChange && onChange(curFormValues);
        }
    };

    const handleOk = () => {
        formRef.current?.handleSubmit();
    };

    const handleSubmit = (_data: any) => {
        onOk?.(formValues);
    };

    // Switch the tab page
    const handleChangeTabs = (_event: React.SyntheticEvent, newValue: string) => {
        setTabKey(newValue);
    };

    useEffect(() => {
        if (config?.config && Object.keys(config.config)?.length) {
            setFormValues({ ...config?.config });
        }
    }, [config.config]);

    return (
        <Modal
            onCancel={handleClose}
            onOk={handleOk}
            title={title || getIntlText('common.plugin_add_title', { 1: config.type })}
            width="1200px"
            sx={{
                '& .MuiDialogContent-root': {
                    padding: '0px',
                    overflow: 'hidden',
                    display: 'flex',
                },
            }}
            footer={null}
            showCloseIcon
            visible
        >
            <div className="config-plugin-container">
                <div className="config-plugin-container-left">
                    <div className="config-plugin-container-left-view">
                        <Suspense>
                            {ComponentView ? (
                                <Suspense>
                                    <ComponentView
                                        config={formValues}
                                        configJson={{ ...config, isPreview: true }}
                                    />
                                </Suspense>
                            ) : (
                                <RenderView
                                    configJson={{ ...config, isPreview: true }}
                                    config={formValues}
                                />
                            )}
                        </Suspense>
                    </div>
                </div>
                <div className="config-plugin-container-right">
                    {/* <Tabs className="ms-tabs" value={tabKey} onChange={handleChangeTabs}>
                        <Tab
                            disableRipple
                            title={getIntlText('common.plugin_config.basic_setting')}
                            label={getIntlText('common.plugin_config.basic_setting')}
                            value="basic"
                        />
                        <Tab
                            disableRipple
                            title={getIntlText('common.plugin_config.advanced_setting')}
                            label={getIntlText('common.plugin_config.advanced_setting')}
                            value="advanced"
                        />
                    </Tabs> */}
                    <div className="ms-tab-content">
                        {/* <TabPanel value={tabKey} index="basic">
                            {ComponentConfig ? (
                                <ComponentConfig
                                    config={config}
                                    onChange={handleChange}
                                    value={formValues}
                                    ref={formRef}
                                    onOk={handleSubmit}
                                />
                            ) : (
                                <RenderConfig
                                    config={config}
                                    onOk={handleSubmit}
                                    ref={formRef}
                                    onChange={handleChange}
                                    value={formValues}
                                />
                            )}
                        </TabPanel>
                        <TabPanel value={tabKey} index="advanced">
                            <JsonView value={formValues} maintainEditStatus />
                        </TabPanel> */}
                        {ComponentConfig ? (
                            <Suspense>
                                <ComponentConfig
                                    config={config}
                                    onChange={handleChange}
                                    value={formValues}
                                    ref={formRef}
                                    onOk={handleSubmit}
                                />
                            </Suspense>
                        ) : (
                            <RenderConfig
                                config={config}
                                onOk={handleSubmit}
                                ref={formRef}
                                onChange={handleChange}
                                value={formValues}
                            />
                        )}
                    </div>
                    <DialogActions className="config-plugin-container-footer">
                        <Button
                            variant="outlined"
                            onClick={handleClose}
                            sx={{ mr: 1, '&:last-child': { mr: 0 } }}
                        >
                            {getIntlText('common.button.cancel')}
                        </Button>
                        <LoadingButton
                            variant="contained"
                            className="ms-modal-button"
                            onClick={handleOk}
                        >
                            {getIntlText('common.button.confirm')}
                        </LoadingButton>
                    </DialogActions>
                </div>
            </div>
        </Modal>
    );
};

export default ConfigPlugin;
