import { useReducer } from './reducer';
import type { ConfigureType, ViewConfigProps } from '../typings';

interface IProps {
    value: ViewConfigProps;
    config: ConfigureType;
    onChange: (data: ViewConfigProps) => void;
}
export const useDeviceChange = ({ value, config, onChange }: IProps) => {
    const { configure } = useReducer({ value, config });

    return {
        configure,
    };
};
