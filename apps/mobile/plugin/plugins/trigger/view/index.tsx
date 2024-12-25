import { useWindowDimensions } from 'react-native';
import { Pressable, VStack, HStack, Text, useModal } from '@ms-mobile-ui/themed';
import Toast from 'react-native-toast-message';
import useI18n from '@milesight/shared/src/hooks/useI18n';

import { DashboardIcon } from '@/plugin/components';
import { useEntityApi, type CallServiceType } from '../../../hooks';
import { ViewConfigProps } from './typings';

interface Props {
    config: ViewConfigProps;
    configJson: CustomComponentProps;
    isEdit?: boolean;
    onLongPress?: () => void;
    mainRef: any;
}

const View = (props: Props) => {
    const { getIntlText } = useI18n();
    const { width } = useWindowDimensions();
    const { getEntityChildren, callService, updateProperty } = useEntityApi();
    const { config ,onLongPress} = props;
    const modal = useModal();

    // 调用服务
    const handleCallService = async (data: Record<string, any>) => {
        const { error } = await callService({
            entity_id: (config?.entity as any)?.value as ApiKey,
            exchange: data,
        } as CallServiceType);
        if (!error) {
            Toast.show({
                type: 'success',
                text1: getIntlText('common.message.operation_success'),
            });
        }
    };

    const handleUpdateProperty = async (data: Record<string, any>) => {
        const { error } = await updateProperty({
            entity_id: (config?.entity as any)?.value as ApiKey,
            exchange: data,
        } as CallServiceType);
        if (!error) {
            Toast.show({
                type: 'success',
                text1: getIntlText('common.message.operation_success'),
            });
        }
    };

    const handleClick = async () => {
        const { error, res } = await getEntityChildren({
            id: (config?.entity as any)?.value as ApiKey,
        });
        const entityType = config?.entity?.rawData?.entityType;
        if (!error) {
            if (res?.length) {
                Toast.show({
                    type: 'error',
                    text1: getIntlText('common.message.not_support_action'),
                });
            } else {
                modal.showDefault({
                    title: '',
                    description: getIntlText('dashboard.plugin.trigger_confirm_text'),
                    buttons: [
                        {
                          text: getIntlText('common.button.cancel'),
                          action: 'secondary',
                          variant: 'outline'
                        },
                        {
                          text: getIntlText('common.button.confirm'),
                          onPress: async () => {
                            const entityKey = (config?.entity as any).rawData?.entityKey;
                            if (entityType === 'SERVICE') {
                                handleCallService({
                                    [entityKey]: null,
                                });
                            } else if (entityType === 'PROPERTY') {
                                handleUpdateProperty({
                                    [entityKey]: null,
                                });
                            }
                            modal.hideModal();
                          },
                          action: 'primary'
                        },
                      ],
                });
            }
        }
    };

    return (
        <Pressable
            borderWidth={1}
            borderRadius="$lg"
            borderColor="$borderLight200"
            bg="$white"
            p="$3"
            width={width - 16}
            onLongPress={onLongPress}
            onPress={handleClick}
        >
            {/* 左侧标题和描述 */}
            <HStack 
                flex={1} 
                space="md" 
                alignItems="center"
                justifyContent="space-between"
            >
                <VStack>
                    {
                        config?.title !== '' && (
                            <Text
                                fontSize="$md"
                                color="$gray700"
                                fontWeight="$bold"
                            >
                                {config?.title}
                            </Text>
                        )
                    }
                    <Text
                        color="$gray500"
                        fontSize="$sm"
                    >   
                        {config?.label}
                    </Text>
                </VStack>

                {/* 右侧图标 */}
                <DashboardIcon
                    name={config?.icon}
                    color={config?.iconColor}
                    size={24}
                    style={{ width: 24, height: 24 }}
                />
            </HStack>
        </Pressable>
    );
};

export default View;
