/* eslint-disable import/namespace */
import React, { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { Box, HStack, Text } from '@ms-mobile-ui/themed';
import { DashboardIcon } from '@/plugin/components';

import { useSource } from './hooks';
import type { ViewConfigProps } from '../typings';

interface Props {
    config: ViewConfigProps;
    configJson: CustomComponentProps;
}

const DataView = (props: Props) => {
    const { config, configJson } = props;
    const { title, entity } = config || {};
    const { entityStatusValue } = useSource({ entity });
    const { width } = useWindowDimensions();
    const { isPreview } = configJson || {};

    // 当前实体实时数据
    const currentEntityData = useMemo(() => {
        const { rawData: currentEntity, value: entityValue } = entity || {};
        if (!currentEntity) return;

        // 获取当前选中实体
        const { entityValueAttribute } = currentEntity || {};
        const { enum: enumStruct, unit } = entityValueAttribute || {};
        const currentEntityStatus = entityStatusValue?.toString();

        // 枚举类型
        if (enumStruct) {
            const currentKey = Object.keys(enumStruct).find(enumKey => {
                return enumKey === currentEntityStatus;
            });
            if (!currentKey) return;

            return {
                label: enumStruct[currentKey],
                value: currentKey,
            };
        }

        // 非枚举类型
        return {
            label: unit ? `${currentEntityStatus ?? '- '}${unit}` : `${currentEntityStatus ?? ''}`,
            value: entityValue,
        };
    }, [entity, entityStatusValue]);

    // 当前实体图标
    const { iconName, iconColor } = useMemo(() => {
        const { value } = currentEntityData || {};
        const iconType = config?.[`Icon_${value}`];
        const iconColor = config?.[`IconColor_${value}`];
        const iconName = iconType;

        return {
            iconName,
            iconColor,
        };
    }, [config, currentEntityData]);

    return (
        <Box
            bg="$white"
            borderRadius="$lg"
            p="$1"
            borderWidth={1}
            borderColor="$borderLight200"
            width={isPreview ? width - 32 : width / 2 - 16}
            minHeight={56}
            mx={isPreview ? '$4' : 0}
            mt={isPreview ? '$2' : 0}
        >
            <HStack 
                space="md"
                alignItems="center"
                flex={1}
            >
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
                        name={iconName}
                        color={iconColor}
                    />
                </Box>
                
                {/* 文本内容部分 */}
                <Box flex={1}>
                    <Text
                        color="$textLight900"
                        fontSize="$md"
                        fontWeight="$medium"
                    >
                        {title ?? '-'}
                    </Text>
                    <HStack alignItems="center" space="sm">
                        <Text
                            color="$textLight500"
                            fontSize="$sm"
                            fontWeight="$medium"
                        >
                            {currentEntityData?.label ?? '-'}
                        </Text>
                    </HStack>
                </Box>
            </HStack>
        </Box>
    );
};
export default DataView;
