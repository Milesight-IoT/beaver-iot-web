import { useTrigger } from './useTrigger';
import type { ViewConfigProps, ConfigureType } from '../../typings';

interface IProps {
    value: ViewConfigProps;
    config: ConfigureType;
    onChange: (data: ViewConfigProps) => void;
}
export const useAction = ({ onChange }: IProps) => {
    const { handleChange } = useTrigger({ onChange });

    return {
        handleChange,
    };
};
