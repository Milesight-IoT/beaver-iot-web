import { isString } from 'lodash-es';
import * as Icons from '@milesight/shared/src/components/icons';
import { useTheme } from '@milesight/shared/src/hooks';
import * as PluginView from '../view-components';
import { parseStyleToReactStyle, parseStyleString, convertCssToReactStyle } from './util';
import './style.less';

interface Props {
    config: any;
    configJson: CustomComponentProps;
    onClick?: () => void;
}

const View = (props: Props) => {
    const { config, configJson, onClick } = props;
    const { theme: globalTheme } = useTheme();

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
    const renderTag = (tagProps: ViewProps, tabKey: string) => {
        if (isShow(tagProps?.showDepended) && tagProps?.tag) {
            const Tag: any = (PluginView as any)[tagProps?.tag] || tagProps?.tag;
            const theme =
                tagProps?.themes?.[`${globalTheme === 'light' ? 'default' : globalTheme}`] || {};
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
            if (Tag === 'icon') {
                const icon = renderParams(tagProps?.params);
                const IconTag = (Icons as any)[icon];
                const iconStyle = style ? parseStyleString(style) : {};
                return (
                    !!icon && (
                        <IconTag
                            className={`${tagProps.class || ''} ${theme?.class || ''}`}
                            sx={{ ...iconStyle, ...dependStyle }}
                            key={`${JSON.stringify(tagProps)}${tabKey}`}
                        />
                    )
                );
            }
            return (
                <Tag
                    key={`${JSON.stringify(tagProps)}${tabKey}`}
                    className={`${tagProps.class || ''} ${theme?.class || ''}`}
                    style={style ? parseStyleToReactStyle(style) : undefined}
                    {...(tagProps.props || {})}
                >
                    {!tagProps?.params ? tagProps?.content : renderParams(tagProps?.params)}
                    {tagProps?.children?.map((subItem, index) => {
                        return renderTag(subItem, `${tabKey}-${index}`);
                    })}
                </Tag>
            );
        }
    };

    const replaceTemplate = (template: string) => {
        return template.replace(/\${{(.*?)}}/g, (match, key) => {
            // 去除 key 两端的空白字符并从 values 对象中获取对应的值
            const value = config[key.trim()];
            // 如果值不存在，返回原始的匹配字符串
            return value !== undefined ? value : match;
        });
    };

    const renderHtml = () => {
        if (configJson?.view) {
            const html = replaceTemplate(configJson?.view as string);
            return <div dangerouslySetInnerHTML={{ __html: html }} />;
        }
        return null;
    };

    return (
        <div onClick={onClick} className="plugin-view">
            {isString(configJson?.view)
                ? renderHtml()
                : configJson?.view?.map((viewItem: ViewProps, index: number) => {
                      return renderTag(viewItem, `${index}`);
                  })}
        </div>
    );
};

export default View;
