import { useMemo, useState, useCallback, useEffect } from 'react';
import { useWindowDimensions, Switch, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { Box, VStack, HStack, Text } from '@ms-mobile-ui/themed';
import useI18n from '@milesight/shared/src/hooks/useI18n';

import { DashboardIcon } from '@/plugin/components';
import { entityAPI, awaitWrap, isRequestSuccess, getResponseData } from '@/services/http';
import ws, { getExChangeTopic } from '@/services/ws';

export interface ViewProps {
    config: {
        entity?: EntityOptionType;
        title?: string;
        offIcon?: string;
        offIconColor?: string;
        onIcon?: string;
        onIconColor?: string;
    };
    configJson: {
        isPreview?: boolean;
    };
}

const View = (props: ViewProps) => {
    const { config, configJson } = props;
    const { entity, title, onIconColor, offIconColor, offIcon, onIcon } = config || {};
    const { isPreview } = configJson || {};
    const { width } = useWindowDimensions();

    const { getIntlText } = useI18n();
    const [isSwitchOn, setIsSwitchOn] = useState(false);

    /**
     * websocket 订阅主题
     */
    const topic = useMemo(
        () => entity?.rawData?.entityKey && getExChangeTopic(entity.rawData.entityKey),
        [entity],
    );

    /**
     * 请求实体状态函数
     */
    const requestEntityStatus = useCallback(async () => {
        if (!entity) return;

        const [error, res] = await awaitWrap(entityAPI.getEntityStatus({ id: entity.value }));

        if (error || !isRequestSuccess(res)) {
            /**
             * 请求失败，以关闭 false 为默认值
             */
            setIsSwitchOn(false);
            return;
        }

        const entityStatus = getResponseData(res);
        setIsSwitchOn(Boolean(entityStatus?.value));
    }, [entity]);

    /**
     * 获取所选实体的状态
     */
    useEffect(() => {
        (async () => {
            if (entity) {
                requestEntityStatus();
            } else {
                /**
                 * 无实体，初始化数据
                 */
                setIsSwitchOn(false);
            }
        })();
    }, [entity, requestEntityStatus]);

    /**
     * websocket 订阅
     */
    useEffect(() => {
        /**
         * 预览状态下不进行 websocket 订阅
         */
        if (!topic || Boolean(isPreview)) return;

        /**
         * 订阅主题时会返回取消订阅的函数，所以直接返回即可在卸载时取消订阅
         */
        return ws.subscribe(topic, requestEntityStatus);
    }, [topic, requestEntityStatus, isPreview]);

    /**
     * 切换 switch 状态时，
     * 更新所选实体的状态数据
     */
    const handleEntityStatus = useCallback(
        async (switchVal: boolean) => {
            const entityKey = entity?.rawData?.entityKey;

            /**
             * 非预览状态，则可以进行数据更新
             */
            if (!entityKey || Boolean(isPreview)) return;

            const [error, res] = await awaitWrap(entityAPI.updateProperty({
                exchange: { [entityKey]: switchVal },
            }));

            if (error) {
                setIsSwitchOn(!switchVal);
                Toast.show({
                    type: 'error',
                    text1: getIntlText('error.http.server_error'),
                });
                return;
            }
        },
        [entity, isPreview],
    );

    const handleSwitchChange = useCallback(
        (val: boolean) => {
            setIsSwitchOn(val);
            handleEntityStatus(val);
        },
        [handleEntityStatus],
    );

    /**
     * 右边大 icon 的展示的颜色
     */
    const iconColor = useMemo(() => {
        return isSwitchOn ? onIconColor : offIconColor;
    }, [isSwitchOn, onIconColor, offIconColor]);

    /**
     * switch title
     */
    const switchTitle = useMemo(() => {
        return isSwitchOn
            ? getIntlText('dashboard.switch_title_on')
            : getIntlText('dashboard.switch_title_off');
    }, [isSwitchOn, getIntlText]);

    return (
        <Box
            p="$2"
            bg="$white"
            borderRadius="$lg"
            borderWidth={1}
            borderColor="$borderLight200"
            width={isPreview ? width - 32 : width - 16}
            mx={isPreview ? '$4' : 0}
            mt={isPreview ? '$2' : 0}
        >
            <HStack alignItems="center">
                {/* 左侧图标和标题区域 */}
                <HStack flex={1} space="sm" alignItems="center">
                    
                    {/* 图标容器 */}
                    <Box
                        bg="$backgroundLight100"
                        p="$3"
                        borderRadius="$full"
                        alignItems="center"
                        justifyContent="center"
                        width={36}
                        height={36}
                    >
                        <DashboardIcon
                            name={isSwitchOn ? onIcon as string : offIcon as string}
                            color={iconColor}
                        />
                    </Box>
                    <VStack>
                        <Text 
                            size="sm" 
                            color="$textLight900"
                            fontWeight="$medium"
                        >
                            {title ?? '-'}
                        </Text>
                        <Text 
                            size="xs" 
                            color="$textLight500"
                        >
                            {switchTitle}
                        </Text>
                    </VStack>
                </HStack>

                {/* 右侧开关 */}
                <Switch
                    value={isSwitchOn}
                    onValueChange={handleSwitchChange}
                    thumbColor="#fff"
                    trackColor={{
                        true: Platform.select({
                            web: '#009688',
                            default: '#0077E6'
                        }),
                        false: '#D4D4D4'
                    }}
                />
            </HStack>
        </Box>
    );
};

export default View;
