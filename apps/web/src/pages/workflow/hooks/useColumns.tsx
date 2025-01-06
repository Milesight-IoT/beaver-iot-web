import React, { useCallback, useMemo, useState } from 'react';
import { Stack, IconButton, Switch, Menu, MenuItem } from '@mui/material';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import {
    DeleteOutlineIcon,
    EditIcon,
    MoreVertIcon,
    IosShareIcon,
    EventNoteIcon,
} from '@milesight/shared/src/components';
import { Tooltip, type ColumnType } from '@/components';
import { type WorkflowAPISchema } from '@/services/http';

type OperationType = 'log' | 'delete' | 'edit' | 'enable' | 'export';

export type TableRowDataType = ObjectToCamelCase<
    WorkflowAPISchema['getList']['response']['content'][0]
>;

export interface UseColumnsProps<T> {
    /**
     * Button Click Callback
     */
    onButtonClick: (type: OperationType, record: T) => void;
}

const useColumns = <T extends TableRowDataType>({ onButtonClick }: UseColumnsProps<T>) => {
    const { getIntlText } = useI18n();
    const { getTimeFormat } = useTime();
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [popoverId, setPopoverId] = useState<string>('');
    const handlerPopoverClose = useCallback(() => {
        setPopoverId('');
        setAnchorEl(null);
    }, []);
    const handlerPopoverOpen = useCallback(
        (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: string) => {
            setPopoverId(id);
            setAnchorEl(e.currentTarget);
        },
        [],
    );
    const columns: ColumnType<T>[] = useMemo(() => {
        return [
            {
                field: 'name',
                headerName: getIntlText('common.label.name'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
                // disableColumnMenu: false,
            },
            {
                field: 'remark',
                headerName: getIntlText('common.label.remark'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
                // disableColumnMenu: false,
            },
            {
                field: 'createdAt',
                headerName: getIntlText('common.label.create_time'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
                renderCell({ value }) {
                    return getTimeFormat(value);
                },
            },
            {
                field: 'updatedAt',
                headerName: getIntlText('common.label.update_time'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
                renderCell({ value }) {
                    return getTimeFormat(value);
                },
            },
            {
                field: 'userNickname',
                headerName: getIntlText('common.label.creator'),
                flex: 1,
                minWidth: 100,
                ellipsis: true,
            },
            {
                field: 'enabled',
                headerName: getIntlText('common.label.enable_status'),
                // align: 'left',
                headerAlign: 'left',
                type: 'boolean',
                filterable: true,
                disableColumnMenu: false,
                flex: 1,
                minWidth: 150,
                renderCell({ row }) {
                    return (
                        <Switch
                            checked={row.enabled}
                            onChange={() => onButtonClick('enable', row)}
                        />
                    );
                },
            },
            {
                field: '$operation',
                headerName: getIntlText('common.label.operation'),
                flex: 1,
                minWidth: 118,
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
                            <Tooltip title={getIntlText('common.label.log')}>
                                <IconButton
                                    sx={{ width: 30, height: 30 }}
                                    onClick={() => onButtonClick('log', row)}
                                >
                                    <EventNoteIcon sx={{ width: 20, height: 20 }} />
                                </IconButton>
                            </Tooltip>
                            <IconButton
                                sx={{ width: 30, height: 30 }}
                                onClick={e => handlerPopoverOpen(e, row.id as string)}
                            >
                                <MoreVertIcon sx={{ width: 20, height: 20 }} />
                            </IconButton>
                            <Menu
                                id={row.id as string}
                                open={popoverId === row.id}
                                anchorEl={anchorEl}
                                className="ms-workflow-list-more-menu"
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                onClose={handlerPopoverClose}
                            >
                                <MenuItem
                                    onClick={() => {
                                        handlerPopoverClose();
                                        onButtonClick('export', row);
                                    }}
                                    sx={{ color: 'text.secondary' }}
                                >
                                    <IosShareIcon sx={{ width: 20, height: 20 }} />
                                    <span className="ms-workflow-list-more-menu-item-text">
                                        {getIntlText('common.label.export')}
                                    </span>
                                </MenuItem>
                                <MenuItem
                                    disabled={row.enabled}
                                    onClick={() => {
                                        handlerPopoverClose();
                                        onButtonClick('delete', row);
                                    }}
                                    sx={{
                                        color: 'text.secondary',
                                        '&:hover': { color: 'error.light' },
                                    }}
                                >
                                    <DeleteOutlineIcon sx={{ width: 20, height: 20 }} />
                                    <span className="ms-workflow-list-more-menu-item-text">
                                        {getIntlText('common.label.delete')}
                                    </span>
                                </MenuItem>
                            </Menu>
                        </Stack>
                    );
                },
            },
        ];
    }, [
        popoverId,
        anchorEl,
        getIntlText,
        getTimeFormat,
        onButtonClick,
        handlerPopoverOpen,
        handlerPopoverClose,
    ]);

    return columns;
};

export default useColumns;
