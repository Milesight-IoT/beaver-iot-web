// import { useRef } from 'react';
import type { ViewConfigProps } from '../../typings';

interface IProps {
    onChange: (data: ViewConfigProps) => void;
}
export const useTrigger = ({ onChange }: IProps) => {
    // const prevStateRef = useRef<ViewConfigProps>();

    const handleChange = (value: ViewConfigProps) => {
        // const { entity } = value || {};
        // const { value: entityValue, rawData } = entity || {};
        // const prevEntityValue = prevStateRef.current?.entity?.value;

        // // If the entity changes, update the title to the currently selected entity name
        // if (prevEntityValue !== entityValue) {
        //     // Currently selected entity
        //     const { entityName } = rawData || {};
        //     entityName && (value.title = entityName);
        // }

        // prevStateRef.current = value;
        onChange(value);
    };

    return {
        handleChange,
    };
};
