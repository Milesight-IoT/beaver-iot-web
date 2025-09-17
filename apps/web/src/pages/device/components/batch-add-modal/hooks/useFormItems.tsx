import { useMemo } from 'react';
import { type ControllerProps } from 'react-hook-form';
import { Grid2 as Grid } from '@mui/material';

import { useI18n } from '@milesight/shared/src/hooks';
import { Select, DownloadIcon, LoadingButton } from '@milesight/shared/src/components';
import { checkRequired } from '@milesight/shared/src/utils/validators';

import { Upload, type FileValueType } from '@/components';
import { useGetIntegration } from '../../../hooks';
import { type BatchAddProps } from '../index';
import { useGetTemplate } from './useGetTemplate';

export function useFormItems() {
    const { getIntlText } = useI18n();
    const { integrationList, firstIntegrationId, loadingIntegrations } = useGetIntegration();
    const { getDeviceTemplate, downloadTemplateLoading } = useGetTemplate();

    const formItems: ControllerProps<BatchAddProps>[] = useMemo(() => {
        return [
            {
                name: 'integration',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                    },
                },
                defaultValue: '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <Grid container spacing={1} sx={{ marginBottom: '16px' }}>
                            <Grid size="grow">
                                <Select
                                    required
                                    fullWidth
                                    options={(integrationList || [])?.map(i => ({
                                        label: i.name,
                                        value: i.id,
                                    }))}
                                    label={getIntlText('common.label.integration')}
                                    error={error}
                                    value={value as ApiKey}
                                    onChange={onChange}
                                />
                            </Grid>
                            <Grid
                                size="auto"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                }}
                            >
                                <LoadingButton
                                    loading={downloadTemplateLoading}
                                    variant="outlined"
                                    sx={{ height: 36, textTransform: 'none' }}
                                    startIcon={<DownloadIcon />}
                                    onClick={() => getDeviceTemplate(value as string)}
                                >
                                    {getIntlText('common.label.download_template')}
                                </LoadingButton>
                            </Grid>
                        </Grid>
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
                        />
                    );
                },
            },
        ];
    }, [getIntlText, integrationList, downloadTemplateLoading, getDeviceTemplate]);

    return {
        formItems,
        /**
         * The first integration
         */
        firstIntegrationId,
        loadingIntegrations,
    };
}
