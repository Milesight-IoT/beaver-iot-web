import { useMemo } from 'react';
import { Stack, IconButton } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { RemoveCircleOutlineIcon } from '@milesight/shared/src/components';
import { Tooltip, type ColumnType } from '@/components';
import { type UserAPISchema } from '@/services/http';

type OperationType = 'remove';

export type TableRowDataType = ObjectToCamelCase<
    UserAPISchema['getRoleAllUsers']['response']['content'][0]
>;

export interface UseColumnsProps<T> {
    /**
     * operation Button callbacks
     */
    onButtonClick: (type: OperationType, record: T) => void;
}

const useColumns = <T extends TableRowDataType>({ onButtonClick }: UseColumnsProps<T>) => {
    const { getIntlText } = useI18n();

    const columns: ColumnType<T>[] = useMemo(() => {
        return [
            {
                field: 'userNickname',
                headerName: getIntlText('user.label.user_name_table_title'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
            },
            {
                field: 'userEmail',
                headerName: getIntlText('common.label.email'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
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
                    return (
                        <Stack
                            direction="row"
                            spacing="4px"
                            sx={{ height: '100%', alignItems: 'center', justifyContent: 'end' }}
                        >
                            <Tooltip title={getIntlText('common.label.remove')}>
                                <IconButton
                                    // color="error"
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
                            </Tooltip>
                        </Stack>
                    );
                },
            },
        ];
    }, [getIntlText, onButtonClick]);

    return columns;
};

export default useColumns;
