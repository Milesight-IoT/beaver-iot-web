import React, { useState, useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Header } from '@react-navigation/elements';
import eventEmitter from '@milesight/shared/src/utils/event-emitter';
import { Ionicons } from '@expo/vector-icons';
import { Box, VStack, Text, KeyboardAwareScrollView } from '@ms-mobile-ui/themed';

import { isRequestSuccess, dashboardAPI, awaitWrap } from '@/services/http';
import { RenderView, RenderConfig } from '@/plugin/render';
import plugins from '@/plugin/plugins';
import useI18n from '@milesight/shared/src/hooks/useI18n';

const AddWidget: React.FC = () => {
    const router = useRouter();
    const { config, dashboardDetail } = useLocalSearchParams();
    const [addWidget, setAddWidget] = useState<any>({});
    const formRef = useRef<any>();
    const { getIntlText } = useI18n();
    const [formValues, setFormValues] = useState<any>({});
    const parsedConfig = JSON.parse(`${config}`);
    const parsedDashboardDetail = JSON.parse(`${dashboardDetail}`);
    const ComponentConfig = (plugins as any)[`${parsedConfig.type}Config`];
    const ComponentView = (plugins as any)[`${parsedConfig.type}View`];

    const handleChange = (data: any, field: string) => {
        setAddWidget((prev: any) => ({ ...prev, [field]: data[field] }));
        setFormValues((prev: any) => ({ ...prev, [field]: data[field] }));
    };

    const handleSubmit = async () => {
        try {
            const now = String(new Date().getTime());
            const newWidget = {
                widget_id: undefined,
                tempId: now,
                data: {
                    ...parsedConfig,
                    config: addWidget,
                    pos: {
                        w: 6,
                        h: 4,
                        minW: 3,
                        minH: 2,
                        i: now,
                        x: 0,
                        y: 0,
                    },
                },
            };
            const updates = {
                widgets: [...(parsedDashboardDetail.widgets || []), newWidget],
                dashboard_id: parsedDashboardDetail.dashboard_id,
                name: parsedDashboardDetail.name,
            };
            const [_, res] = await awaitWrap(dashboardAPI.updateDashboard(updates));
            if (isRequestSuccess(res)) {
                eventEmitter.publish('REFRESH_DASHBOARD');
                router.back();
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const renderHeader = () => {
        return (
            <Header
                title={getIntlText('dashboard.add_widget')}
                headerLeft={() => (
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingLeft: 16,
                            gap: 2,
                        }}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="chevron-back" size={24} color="#666" />
                        <Text color="#666" fontSize="$md">
                            Back
                        </Text>
                    </TouchableOpacity>
                )}
                headerStyle={{
                    backgroundColor: 'white',
                }}
                headerTitleStyle={{
                    fontSize: 17,
                    fontWeight: '600',
                }}
            />
        );
    };

    useFocusEffect(
        React.useCallback(() => {
            //blur时需要清空formValues，避免下次进入时formValues有值
            return () => {
                setFormValues({});
            }
        }, [])
    );

    return (
        <Box flex={1} backgroundColor="white">
            {renderHeader()}
            <KeyboardAwareScrollView flex={1} backgroundColor="#fff">
                <VStack>
                    {ComponentView ? (
                        <ComponentView
                            config={formValues}
                            configJson={{ ...parsedConfig, isPreview: true }}
                        />
                    ) : (
                        <RenderView
                            configJson={{ ...parsedConfig, isPreview: true }}
                            config={formValues}
                        />
                    )}
                    {ComponentConfig ? (
                        <ComponentConfig
                            config={parsedConfig}
                            onChange={handleChange}
                            value={formValues}
                            ref={formRef}
                            onOk={handleSubmit}
                        />
                    ) : (
                        <RenderConfig
                            config={parsedConfig}
                            onOk={handleSubmit}
                            ref={formRef}
                            onChange={handleChange}
                            value={formValues}
                        />
                    )}
                </VStack>
            </KeyboardAwareScrollView>
        </Box>
    );
};

export default AddWidget;
