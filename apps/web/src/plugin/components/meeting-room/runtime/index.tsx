import { useAction } from './action';
import { useReducer } from './reducer';
import type { ConfigureType, ViewConfigProps } from '../typings';

interface IProps {
    value: ViewConfigProps;
    config: ConfigureType;
    onChange: (data: ViewConfigProps) => void;
}
export const useConnect = ({ value, config, onChange }: IProps) => {
    const { handleChange } = useAction({ value, config, onChange });
    const { configure } = useReducer({ value, config });

    return {
        configure,
        handleChange,
    };
};
