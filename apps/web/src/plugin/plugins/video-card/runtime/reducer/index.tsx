import { useMemo } from 'react';
import { cloneDeep } from 'lodash-es';
import { useDynamic } from './useDynamic';
import type { ConfigureType, ViewConfigProps } from '../../typings';

interface IProps {
    value: ViewConfigProps;
    config: ConfigureType;
}
export const useReducer = ({ value, config }: IProps) => {
    const { updateDynamicForm } = useDynamic();

    // /** config实时保存value */
    // const updateConfigState = (value: ViewConfigProps, config: ConfigureType) => {
    //     config.config = value || {};

    //     return config;
    // };

    /** 生成新的configure */
    const configure = useMemo(() => {
        // 按顺序执行回调，返回最新的configure
        const ChainCallList = [updateDynamicForm];

        const newConfig = ChainCallList.reduce((config, fn) => {
            return fn(value, cloneDeep(config));
        }, config);

        return { ...newConfig };
    }, [value, config]);

    return {
        configure,
    };
};
