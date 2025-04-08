import { forwardRef, useEffect, useCallback } from 'react';
import { RenderConfig } from '../../../render';
import { ImageConfigType } from '../typings';
import useFormData from './useFormData';

interface ConfigPluginProps {
    config: CustomComponentProps;
    value: any;
    onOk: (data: any) => void;
    onChange: (data: any) => void;
}

const Plugin = forwardRef((props: ConfigPluginProps, ref: any) => {
    const { onOk, onChange, value, config } = props;
    const [resultValue, resultConfig] = useFormData(value, config);

    const handleSubmit = (data: any) => {
        onOk(data);
    };

    const handleChange = useCallback(
        (data: ImageConfigType) => {
            switch (data.dataType) {
                case 'entity': {
                    onChange({
                        ...data,
                        file: null,
                        url: null,
                    });
                    break;
                }
                case 'upload': {
                    onChange({
                        ...data,
                        entity: null,
                        url: null,
                    });
                    break;
                }
                case 'url': {
                    onChange({
                        ...data,
                        entity: null,
                        file: null,
                    });
                    break;
                }
                default: {
                    onChange(data);
                    break;
                }
            }
        },
        [onChange],
    );

    useEffect(() => {
        const setValue = ref?.current?.setValue;
        if (!setValue) return;

        // Hack: Reset the url/entity value to fix the validate error
        switch (resultValue.dataType) {
            case 'entity': {
                setValue('entity', resultValue.entity);
                break;
            }
            case 'url': {
                setValue('url', resultValue.url);
                break;
            }
            default: {
                break;
            }
        }
    }, [resultValue, ref]);

    return (
        <RenderConfig
            config={resultConfig}
            onOk={handleSubmit}
            ref={ref}
            onChange={handleChange}
            value={resultValue}
        />
    );
});

export default Plugin;
