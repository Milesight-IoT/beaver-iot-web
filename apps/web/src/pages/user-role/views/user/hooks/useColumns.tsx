import { useMemo } from 'react';
import { Stack, IconButton, Chip } from '@mui/material';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import { DeleteOutlineIcon, EditIcon, CachedIcon } from '@milesight/shared/src/components';
import { Tooltip, type ColumnType } from '@/components';
import { type UserAPISchema } from '@/services/http';
import styles from '../style.module.less';

type OperationType = 'resetPassword' | 'edit' | 'delete';

export type TableRowDataType = ObjectToCamelCase<
    UserAPISchema['getAllUsers']['response']['content'][0]
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
                field: 'nickname',
                headerName: getIntlText('user.label.user_name_table_title'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
            },
            {
                field: 'roles',
                headerName: getIntlText('user.label.role_table_title'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
                renderCell({ value }) {
                    const roles: TableRowDataType['roles'] = value || [];

                    return roles.map(r => (
                        <Chip
                            key={r.roleId}
                            label={r?.roleName || ''}
                            className={styles['users-role-chip']}
                        />
                    ));
                },
            },
            {
                field: 'email',
                headerName: getIntlText('common.label.email'),
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
                display: 'flex',
                width: 120,
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
                            <Tooltip title={getIntlText('common.button.edit')}>
                                <IconButton
                                    sx={{ width: 30, height: 30 }}
                                    onClick={() => onButtonClick('edit', row)}
                                >
                                    <EditIcon sx={{ width: 20, height: 20 }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={getIntlText('user.label.reset_password')}>
                                <IconButton
                                    sx={{ width: 30, height: 30 }}
                                    onClick={() => onButtonClick('resetPassword', row)}
                                >
                                    <CachedIcon sx={{ width: 20, height: 20 }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={getIntlText('common.label.delete')}>
                                <IconButton
                                    // color="error"
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        color: 'text.secondary',
                                        // '&:hover': { color: 'error.light' },
                                    }}
                                    onClick={() => onButtonClick('delete', row)}
                                >
                                    <DeleteOutlineIcon sx={{ width: 20, height: 20 }} />
                                </IconButton>
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
