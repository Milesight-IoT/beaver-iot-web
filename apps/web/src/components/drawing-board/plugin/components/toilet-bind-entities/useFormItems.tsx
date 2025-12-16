import { useMemo } from 'react';
import { type ControllerProps } from 'react-hook-form';
import { FormControl, InputLabel } from '@mui/material';

import { useI18n } from '@milesight/shared/src/hooks';
import { DownloadIcon, LoadingButton } from '@milesight/shared/src/components';
import { checkRequired } from '@milesight/shared/src/utils/validators';

import { Upload, type FileValueType } from '@/components';
import { type BatchAddProps } from './BindEntitiesModal';
import { useGetTemplate } from './useGetTemplate';

export function useFormItems() {
    const { getIntlText } = useI18n();
    const { getTemplate, downloadTemplateLoading } = useGetTemplate();

    const formItems: ControllerProps<BatchAddProps>[] = useMemo(() => {
        return [
            {
                name: 'buildingTemplate',
                render() {
                    return (
                        <FormControl>
                            <InputLabel>{getIntlText('common.label.template')}</InputLabel>
                            <LoadingButton
                                loading={downloadTemplateLoading}
                                variant="outlined"
                                sx={{ height: 36, textTransform: 'none' }}
                                startIcon={<DownloadIcon />}
                                onClick={() => getTemplate()}
                            >
                                {getIntlText('common.label.download_template')}
                            </LoadingButton>
                        </FormControl>
                    );
                },
            },
            {
                name: 'uploadFile',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                    },
                },
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <Upload
                            required
                            label={getIntlText('common.label.upload_file')}
                            value={value as FileValueType}
                            onChange={onChange}
                            error={error}
                            accept={{
                                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                                    ['.xlsx'],
                            }}
                            autoUpload={false}
                            errorInterceptor={error => {
                                if (error?.code === 'file_invalid_type') {
                                    return {
                                        ...error,
                                        message: `${getIntlText(
                                            'common.message.upload_error_file_invalid_type',
                                            {
                                                1: '.xlsx',
                                            },
                                        )}`,
                                    };
                                }

                                return error;
                            }}
                            maxSize={1024 * 1024 * 5}
                        />
                    );
                },
            },
        ];
    }, [getIntlText, getTemplate, downloadTemplateLoading]);

    return {
        formItems,
    };
}
