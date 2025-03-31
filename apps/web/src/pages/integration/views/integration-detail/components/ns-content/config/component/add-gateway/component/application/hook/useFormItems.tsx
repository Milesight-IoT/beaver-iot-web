import { useMemo } from 'react';
import { type ControllerProps, type FieldValues } from 'react-hook-form';
import { useI18n } from '@milesight/shared/src/hooks';
import { checkRequired } from '@milesight/shared/src/utils/validators';
import { Select } from '@milesight/shared/src/components';
import { DeviceListAppItem } from '@/services/http/embedded-ns';

/**
 * Form data type
 */
type ExtendControllerProps<T extends FieldValues> = ControllerProps<T> & {
    /**
     * To Control whether the current component is rendered
     */
    shouldRender?: (data: Partial<T>) => boolean;
};

export interface ApplicationPropsType {
    eui: string | undefined;
    name: string | undefined;
    credential_id?: string;
    client_id?: string;
    application_id?: string;
    applicationOptions: DeviceListAppItem[];
    onBack: (applicationConfig: ApplicationType) => void;
    onSuccess: () => void;
}

export type ApplicationType = {
    application_id: string;
};

type IProps = {
    applicationOptions: DeviceListAppItem[];
};

const useFormItems = (props: IProps) => {
    const { applicationOptions } = props;
    const { getIntlText } = useI18n();

    const formItems = useMemo(() => {
        const result: ExtendControllerProps<ApplicationType>[] = [];

        result.push({
            name: 'application_id',
            rules: {
                validate: { checkRequired: checkRequired() },
            },
            render({ field: { onChange, value }, fieldState: { error } }) {
                return (
                    <Select
                        required
                        fullWidth
                        error={error}
                        label={getIntlText('setting.integration.label.application_id')}
                        options={applicationOptions.map(item => {
                            return {
                                label: item.app_name,
                                value: item.application_id,
                            };
                        })}
                        formControlProps={{
                            sx: { my: 1.5 },
                        }}
                        value={(value as ApplicationType['application_id']) || ''}
                        onChange={onChange}
                    />
                );
            },
        });

        return result;
    }, [getIntlText]);

    return formItems;
};

export default useFormItems;
