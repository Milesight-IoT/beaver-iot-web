import React, { useRef, Suspense, useEffect } from 'react';
import { DialogActions, Button, List } from '@mui/material';
import { isPlainObject, isEmpty } from 'lodash-es';

import { Modal, LoadingButton, LoadingWrapper } from '@milesight/shared/src/components';
import { useI18n } from '@milesight/shared/src/hooks';
// import { TabPanel } from '@/components';
import { RenderView } from '../render';
import plugins from '../plugins';
import type { BoardPluginProps } from '../types';
import {
    ControlPanelContainer,
    type ControlPanelContainerExposeProps,
} from '../render/control-panel';
import useControlPanelStore from '../store';
import './style.less';

interface ConfigPluginProps {
    operatingPlugin: BoardPluginProps;
    onClose: () => void;
    onOk?: (data: any) => void;
    onChange?: (data: any) => void;
    title?: string;
}

const ConfigPlugin = (props: ConfigPluginProps) => {
    const { operatingPlugin, onClose, onOk, onChange, title } = props;

    const { getIntlText } = useI18n();
    const { formData, updateFormData } = useControlPanelStore();

    const ComponentConfig = (plugins as any)[`${operatingPlugin.type}Config`];
    const ComponentView = (plugins as any)[`${operatingPlugin.type}View`];
    const formRef = useRef<ControlPanelContainerExposeProps>(null);
    // const [formValues, setFormValues] = useState<any>({});
    // const [tabKey, setTabKey] = useState<string>('basic');

    const handleClose = () => {
        onClose();
    };

    // const handleChange = (values: any) => {
    //     const curFormValues = { ...formValues };
    //     Object.keys(values).forEach((key: string) => {
    //         if (values[key] !== undefined) {
    //             curFormValues[key] = values[key];
    //         }
    //     });
    //     if (curFormValues && Object.keys(curFormValues)?.length) {
    //         setFormValues(curFormValues);
    //         onChange && onChange(curFormValues);
    //     }
    // };

    const handleOk = () => {
        formRef.current?.handleSubmit();
    };

    const handleSubmit = (_data: AnyDict) => {
        onOk?.(_data);
    };

    // Switch the tab page
    // const handleChangeTabs = (_event: React.SyntheticEvent, newValue: string) => {
    //     setTabKey(newValue);
    // };

    // useEffect(() => {
    //     if (config?.config && Object.keys(config.config)?.length) {
    //         setFormValues({ ...config?.config });
    //     }
    // }, [config.config]);

    // resolve trigger two requests for entity historical data
    // const pluginConfig = useMemo(() => {
    //     return { ...(config?.config || {}) };
    // }, [JSON.stringify(config.config)]);

    /**
     * Initial Form data by dashboard plugin config
     */
    useEffect(() => {
        const data = operatingPlugin?.config;

        if (!isPlainObject(data) || isEmpty(data)) {
            updateFormData(undefined);
            return;
        }

        updateFormData(data);
    }, [operatingPlugin?.config, updateFormData]);

    return (
        <Modal
            onCancel={handleClose}
            onOk={handleOk}
            title={title || getIntlText('common.plugin_add_title', { 1: operatingPlugin.type })}
            width="1200px"
            sx={{
                '&.ms-modal-root .MuiPaper-root .ms-modal-content.MuiDialogContent-root': {
                    display: 'flex',
                    paddingRight: '0px ',
                    overflow: 'hidden',
                },
                '.MuiPaper-root.MuiDialog-paper': {
                    height: '720px',
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
                                        config={formData}
                                        configJson={{ ...operatingPlugin, isPreview: true }}
                                    />
                                </Suspense>
                            ) : (
                                <RenderView
                                    configJson={{ ...operatingPlugin, isPreview: true }}
                                    config={formData}
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
                    {/* <div className="ms-tab-content"> */}
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
                        <Suspense
                            fallback={
                                <LoadingWrapper loading>
                                    <List
                                        sx={{
                                            height: 100,
                                        }}
                                    />
                                </LoadingWrapper>
                            }
                        >
                            <ComponentConfig
                                ref={formRef}
                                config={operatingPlugin}
                                onOk={handleSubmit}
                            />
                        </Suspense>
                    ) : (
                        <ControlPanelContainer
                            ref={formRef}
                            controlPanel={operatingPlugin?.originalControlPanel}
                            onOk={handleSubmit}
                        />
                    )}
                    {/* </div> */}
                    <DialogActions className="config-plugin-container-footer">
                        <Button
                            variant="outlined"
                            onClick={handleClose}
                            sx={{ mr: 0.5, '&:last-child': { mr: 0 } }}
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

export default React.memo(ConfigPlugin);
