import { Dispatch, SetStateAction, useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { type ColumnType } from '@/components';
import { DeviceModelItem, GatewayAPISchema } from '@/services/http/embedded-ns';
import { useI18n } from '@milesight/shared/src/hooks';
import { isEqual } from 'lodash-es';

export type TableRowDataType = ObjectToCamelCase<
    GatewayAPISchema['getSyncAbleDevices']['response'][0]
>;

export interface UseColumnsProps<T> {
    modelOptions: DeviceModelItem[];
    selectedIds: readonly ApiKey[];
    modelMap: Map<string, string>;
    setModelMap: Dispatch<SetStateAction<Map<string, string>>>;
}

const useColumns = <T extends TableRowDataType>({
    modelOptions,
    selectedIds,
    modelMap,
    setModelMap,
}: UseColumnsProps<T>) => {
    const { getIntlText } = useI18n();

    const handleChangeModel = (eui: string, model: string) => {
        modelMap.set(eui, model);
        setModelMap(modelMap);
    };

    const columns: ColumnType<T>[] = useMemo(() => {
        return [
            {
                field: 'name',
                headerName: getIntlText('device.label.param_device_name'),
                flex: 1.1,
                minWidth: 200,
                ellipsis: true,
            },
            {
                field: 'eui',
                headerName: getIntlText('setting.integration.label.device.eui'),
                flex: 1,
                minWidth: 200,
                ellipsis: true,
                renderCell({ value }) {
                    return value;
                },
            },
            {
                field: 'guessModelId',
                headerName: getIntlText('setting.integration.label.model'),
                flex: 1,
                minWidth: 300,
                align: 'left',
                headerAlign: 'left',
                renderCell({ row, value }) {
                    return (
                        <Autocomplete
                            options={modelOptions}
                            isOptionEqualToValue={(option, value) => isEqual(option, value)}
                            renderInput={params => (
                                <TextField
                                    {...params}
                                    label=""
                                    error={
                                        selectedIds.includes(row.eui) &&
                                        !modelMap.get(row.eui) &&
                                        !row.guessModelId
                                    }
                                    helperText={null}
                                    placeholder={getIntlText('common.label.please_select')}
                                    InputProps={{
                                        ...params.InputProps,
                                        size: 'small',
                                    }}
                                />
                            )}
                            value={value || modelMap?.get(row.eui)}
                            onChange={(_, option: any) => {
                                handleChangeModel(row.eui, option?.value);
                            }}
                        />
                    );
                },
            },
        ];
    }, [getIntlText, modelOptions, selectedIds, modelMap]);

    return columns;
};

export default useColumns;
