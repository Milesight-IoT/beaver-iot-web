import { useMemo } from 'react';
import { Stack, IconButton } from '@mui/material';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import { RemoveCircleOutlineIcon } from '@milesight/shared/src/components';
import { Tooltip, type ColumnType } from '@/components';
import { type UserAPISchema } from '@/services/http';

import styles from '../../../style.module.less';

type OperationType = 'remove';

export type TableRowDataType = ObjectToCamelCase<
    UserAPISchema['getRoleAllDevices']['response']['content'][0]
>;

export interface UseColumnsProps<T> {
    /**
     * operation Button callbacks
     */
    onButtonClick: (type: OperationType, record: T) => void;
}

const useColumns = <T extends TableRowDataType>({ onButtonClick }: UseColumnsProps<T>) => {
    const { getIntlText } = useI18n();
    const { getTimeFormat } = useTime();

    const columns: ColumnType<T>[] = useMemo(() => {
        return [
            {
                field: 'deviceName',
                headerName: getIntlText('device.label.param_device_name'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
            },
            {
                field: 'integrationName',
                headerName: getIntlText('common.label.source'),
                flex: 1,
                minWidth: 300,
                ellipsis: true,
            },
            {
                field: 'userNickname',
                headerName: getIntlText('common.label.creator'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
            },
            {
                field: 'createdAt',
                headerName: getIntlText('common.label.create_time'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
                renderCell({ value }) {
                    return getTimeFormat(Number(value));
                },
            },
            {
                field: '$operation',
                headerName: getIntlText('common.label.operation'),
                width: 120,
                display: 'flex',
                align: 'left',
                headerAlign: 'left',
                fixed: 'right',
                renderCell({ row }) {
                    const isDisabledRemove = Boolean(row?.roleIntegration);
                    const tip = isDisabledRemove
                        ? getIntlText('user.role.device_can_not_remove_tip')
                        : getIntlText('common.label.remove');

                    return (
                        <Stack
                            direction="row"
                            spacing="4px"
                            sx={{ height: '100%', alignItems: 'center', justifyContent: 'end' }}
                        >
                            <Tooltip title={tip}>
                                <div className={styles['flex-layout']}>
                                    <IconButton
                                        // color="error"
                                        disabled={isDisabledRemove}
                                        sx={{
                                            width: 30,
                                            height: 30,
                                            color: 'text.secondary',
                                            // '&:hover': { color: 'error.light' },
                                        }}
                                        onClick={() => onButtonClick('remove', row)}
                                    >
                                        <RemoveCircleOutlineIcon sx={{ width: 20, height: 20 }} />
                                    </IconButton>
                                </div>
                            </Tooltip>
                        </Stack>
                    );
                },
            },
        ];
    }, [getIntlText, onButtonClick, getTimeFormat]);

    return columns;
};

export default useColumns;
