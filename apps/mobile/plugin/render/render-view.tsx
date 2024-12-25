import RenderHtml from 'react-native-render-html';
import { View, useWindowDimensions, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import React from 'react';
import { isString } from 'lodash-es';

// import * as Icons from '@milesight/shared/src/components/icons';
import Ionicons from '@expo/vector-icons/Ionicons';
// import { Ionicons } from '@expo/vector-icons'; // 正确



import { parseStyleToReactStyle, convertCssToReactStyle } from './util';
import * as PluginView from '../view-components';

interface Props {
    config: any;
    configJson: any;
    onClick?: () => void;
}

const RNView = (props: Props) => {
    const { config, configJson, onClick } = props;
    const { width } = useWindowDimensions();

    // 处理显示依赖
    const isShow = (depended?: Record<string, any>) => {
        if (depended) {
            for (const key in depended) {
                if (depended[key] !== (config as any)?.[key]) {
                    return false;
                }
            }
        }
        return true;
    };

    // 渲染参数
    const renderParams = (params?: Record<string, any>) => {
        if (params?.length) {
            const result = params.map((key: string) => {
                return (config as any)?.[key];
            });
            return result?.join('');
        }
        return null;
    };

    // 渲染标签
    const renderTag = (tagProps: any, tabKey: string) => {
        if (isShow(tagProps?.showDepended) && tagProps?.tag) {
            const Tag: any = (PluginView as any)[tagProps?.tag] || View;
            const theme = tagProps?.themes?.default;
            const style = `${tagProps?.style || ''}${theme?.style}`;
            const dependStyle: Record<string, string> = {};
            if (tagProps?.styleDepended) {
                for (const key in tagProps?.styleDepended) {
                    if ((config as any)?.[tagProps?.styleDepended[key]]) {
                        dependStyle[convertCssToReactStyle(key)] = (config as any)?.[
                            tagProps?.styleDepended[key]
                        ];
                    }
                }
            }
            // if (tagProps?.tag === 'icon') {
            //     const icon = renderParams(tagProps?.params);
            //     const IconTag = (Ionicons as any)[icon];
            //     const iconStyle = style ? parseStyleString(style) : {};
            //     return (
            //         !!icon && (
            //             <IconTag
            //                 style={[iconStyle, dependStyle]}
            //             />
            //         )
            //     );
            // }
            return (
                <Tag
                    key={tabKey}
                    style={[parseStyleToReactStyle(style), dependStyle]}
                    {...(tagProps.props || {})}
                >
                    {!tagProps?.params ? (
                        <Text>{tagProps?.content}</Text>
                    ) : (
                        <Text>{renderParams(tagProps?.params)}</Text>
                    )}
                    {/* @ts-expect-error */}
                    {tagProps?.children?.map((subItem, index) => {
                        return renderTag(subItem, `${tabKey}-${index}`);
                    })}
                </Tag>
            );
        }
    };

    const replaceTemplate = (template: string) => {
        return template.replace(/\${{(.*?)}}/g, (match, key) => {
            const value = config[key.trim()];
            return value !== undefined ? value : match;
        });
    };

    const renderHtml = () => {
        if (configJson?.view) {
            const html = replaceTemplate(configJson?.view as string);
            console.log('html: ', html);
            return <RenderHtml contentWidth={width} source={{ html }} />;
        }
        return null;
    };

    return (
        <Pressable onPress={onClick} style={styles.pluginView}>
            {isString(configJson?.view)
                ? renderHtml()
                : configJson?.view?.map((viewItem: any, index: number) => {
                    return renderTag(viewItem, `${index}`);
                })}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
    },
    pluginView: {
        flex: 1,
        width: Dimensions.get('window').width,
    },
});

export default RNView;
