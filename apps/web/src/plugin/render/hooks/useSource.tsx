import { useMemo } from 'react';
import modelStore from '@/adapter/models';
import { PluginProps } from '@/adapter';

interface IProps {
    viewProps: PluginProps;
    tagProps: ViewProps;
}
export const useSource = ({ tagProps, viewProps }: IProps) => {
    const { adapter } = tagProps || {};
    const { model } = adapter || {};

    const useModel = useMemo(() => {
        const useModel = modelStore[model as keyof typeof modelStore];

        if (!useModel) {
            throw new Error(`Chart adapter ${model} model is not found`);
        }
        return useModel;
    }, [model]);

    // 返回转化后的数据结构
    return useModel({ viewProps, adapter: adapter! });
};
