import { Dispatch, SetStateAction, useMemo } from 'react';
import {
    MenuItem,
    Select,
    FormHelperText,
    Autocomplete,
    TextField,
    FormControl,
} from '@mui/material';
import { type ColumnType } from '@/components';
import { DeviceModelItem, GatewayAPISchema } from '@/services/http/embeddedNs';
import { useI18n } from '@milesight/shared/src/hooks';
import { isEqual } from 'lodash-es';

export type TableRowDataType = ObjectToCamelCase<
    GatewayAPISchema['getSyncAbleDevices']['response'][0]
>;

export interface UseColumnsProps<T> {
    modelOptions: DeviceModelItem[] | undefined;
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
                            isOptionEqualToValue={(option: string, value: unknown) =>
                                isEqual(option, value)
                            }
                            helperText={null}
                            placeholder={getIntlText('common.label.please_select')}
                            renderInput={params => (
                                <TextField
                                    {...params}
                                    label=""
                                    error={
                                        selectedIds.includes(row.eui) &&
                                        !modelMap.get(row.eui) &&
                                        !row.guessModelId
                                    }
                                    InputProps={{
                                        ...params.InputProps,
                                        size: 'small',
                                    }}
                                />
                            )}
                            value={value || modelMap?.get(row.eui)}
                            onChange={(_, option) => {
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
