import { useMemo } from 'react';
import { type ControllerProps } from 'react-hook-form';
import { Box, IconButton } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { AutoAwesomeIcon } from '@milesight/shared/src/components';
import CodeEditor from '../../code-editor';

export interface FormDataProps {
    data: string;
}

interface FormItemsType {
    simulatedDataLoading: boolean;
    genSimulatedData: () => void;
}

const useFormItems = ({ simulatedDataLoading, genSimulatedData }: FormItemsType) => {
    const { getIntlText } = useI18n();

    const formItems = useMemo(() => {
        const result: ControllerProps<FormDataProps>[] = [
            {
                name: 'data',
                rules: {
                    validate: {
                        checkJsonFormat(jsonString) {
                            try {
                                JSON.parse(jsonString);
                            } catch (error: any) {
                                return error.message;
                            }
                            return true;
                        },
                    },
                },
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <CodeEditor
                            error={error}
                            required={false}
                            editorLang="json"
                            title="JSON"
                            defaultHeight={500}
                            value={value}
                            onChange={onChange}
                            placeholder={getIntlText('common.placeholder.input')}
                            loading={simulatedDataLoading}
                            loadingText={getIntlText(
                                'setting.integration.generating_simulated_data',
                            )}
                            rightSlot={
                                <Box
                                    onClick={genSimulatedData}
                                    sx={{
                                        color: 'primary.main',
                                        fontSize: 14,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <IconButton>
                                        <AutoAwesomeIcon
                                            color="primary"
                                            sx={{ width: 16, height: 16 }}
                                        />
                                    </IconButton>
                                    {getIntlText('setting.integration.gen_simulating_data')}
                                </Box>
                            }
                        />
                    );
                },
            },
        ];
        return result;
    }, [getIntlText, simulatedDataLoading]);

    return formItems;
};

export default useFormItems;
