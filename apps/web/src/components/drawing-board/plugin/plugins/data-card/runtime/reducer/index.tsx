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

    /** Generate new configure */
    const configure = useMemo(() => {
        // Execute the callback in order and return the latest configure
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
