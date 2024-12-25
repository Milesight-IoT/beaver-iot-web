import React from 'react';
import type { PluginProps } from '@/adapter';
import ChartComponent from './chartComponent';
import { useSource } from '../hooks/useSource';
import * as chartViews from '../../view-components/chart-view';

interface IProps {
    tag: string;
    viewProps: PluginProps;
    tagProps: ViewProps;
    children: React.ReactElement;
}
const ChartTypes = Object.keys(chartViews);

export default React.memo(({ tag, children, ...rest }: IProps) => {
    if ([...ChartTypes, 'chart'].includes(tag)) {
        return (
            <ChartBlock tag={tag} {...rest}>
                {children}
            </ChartBlock>
        );
    }

    return children;
});

export const ChartBlock = React.memo(({ tag, viewProps, tagProps, children }: IProps) => {
    const { data: injectData, ...rest } = useSource({ viewProps, tagProps });

    if (ChartTypes.includes(tag)) {
        return React.Children.map(children, child => {
            return React.cloneElement(child, {
                ...(injectData || {}),
                ...rest,
            });
        });
    }
    return (
        <ChartComponent injectData={injectData} tagProps={tagProps}>
            {children}
        </ChartComponent>
    );
});
