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

        // // 如果实体变化时，更新title为当前选中实体名称
        // if (prevEntityValue !== entityValue) {
        //     // 当前选中实体
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
