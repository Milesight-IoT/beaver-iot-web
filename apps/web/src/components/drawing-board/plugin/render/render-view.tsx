import { isString } from 'lodash-es';
import * as Icons from '@milesight/shared/src/components/icons';
import { useTheme } from '@milesight/shared/src/hooks';
import * as PluginView from '../view-components';
import { parseStyleToReactStyle, parseStyleString, convertCssToReactStyle } from './util';
import type { BoardPluginProps } from '../types';
import './style.less';

interface Props {
    config: any;
    configJson: BoardPluginProps;
    onClick?: () => void;
}

const View = (props: Props) => {
    const { config, configJson, onClick } = props;
    const { theme: globalTheme } = useTheme();

    // Process display dependencies
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

    // Rendering parameter
    const renderParams = (params?: Record<string, any>) => {
        if (params?.length) {
            const result = params.map((key: string) => {
                return (config as any)?.[key];
            });
            return result?.join('');
        }
        return null;
    };

    // Rendering label
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
            // Remove the blank characters at both ends of the key and get the corresponding value from the values object
            const value = config[key.trim()];
            // If the value does not exist, return the original matching string
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
