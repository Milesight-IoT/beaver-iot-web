import { useMemo } from 'react';
import { type ControllerProps } from 'react-hook-form';
import { useI18n } from '@milesight/shared/src/hooks';
import { checkRequired } from '@milesight/shared/src/utils/validators';
import { UploadFileIcon } from '@milesight/shared/src/components';
import UploadField from '../components/uploadField';

/**
 * type of dataSource
 */
export type FormDataProps = {
    file: File[];
};

const useImportFormItems = () => {
    const { getIntlText } = useI18n();
    const formItems = useMemo(() => {
        const result: ControllerProps<FormDataProps>[] = [];
        result.push({
            name: 'file',
            rules: {
                validate: {
                    checkRequired: checkRequired(),
                },
            },
            render({ field: { onChange, value }, fieldState: { error } }) {
                return (
                    <UploadField
                        accept="application/json"
                        value={value}
                        error={error?.message}
                        uploadIcon={
                            <UploadFileIcon sx={{ width: 22, height: 22, fill: '#6B7785' }} />
                        }
                        uploadTips={getIntlText('workflow.modal.upload_tips')}
                        onChange={onChange}
                    />
                );
            },
        });

        return result;
    }, [getIntlText]);

    return formItems;
};

export default useImportFormItems;
