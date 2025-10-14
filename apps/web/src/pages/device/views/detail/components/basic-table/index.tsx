import { useCallback, useMemo, useState, forwardRef, useImperativeHandle } from 'react';
import { Stack, IconButton } from '@mui/material';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import { EditIcon } from '@milesight/shared/src/components';
import { Descriptions, Tooltip, PermissionControlHidden } from '@/components';
import { type DeviceAPISchema } from '@/services/http';
import { PERMISSIONS } from '@/constants';
import EditDialog from './edit-dialog';
import './style.less';

interface Props {
    /** Loading or not */
    loading?: boolean;

    /** Device details */
    data?: ObjectToCamelCase<DeviceAPISchema['getDetail']['response']>;

    /** Edit successful callback */
    onEditSuccess?: () => void;
}

export interface BasicTableInstance {
    /** Open the edit pop-up window */
    openEditDialog: () => void;
}

/**
 * Table of basic device information
 */
const BasicTable = (
    { data, loading, onEditSuccess }: Props,
    ref?: React.ForwardedRef<BasicTableInstance>,
) => {
    const { getIntlText } = useI18n();
    const { getTimeFormat } = useTime();
    const [dialogOpen, setDialogOpen] = useState(false);
    const descList = useMemo(() => {
        return [
            {
                key: 'name',
                label: getIntlText('common.label.name'),
                content: (
                    <Stack
                        direction="row"
                        className="device-name"
                        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                    >
                        <Tooltip autoEllipsis title={data?.name} />
                        <PermissionControlHidden permissions={PERMISSIONS.DEVICE_EDIT}>
                            <IconButton
                                sx={{ width: 22, height: 22 }}
                                onClick={() => {
                                    setDialogOpen(true);
                                }}
                            >
                                <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </PermissionControlHidden>
                    </Stack>
                ),
            },
            {
                key: 'externalId',
                label: getIntlText('device.label.param_external_id'),
                content: data?.identifier,
            },
            {
                key: 'source',
                label: getIntlText('common.label.source'),
                content: <Tooltip autoEllipsis title={data?.integrationName} />,
            },
            {
                key: 'createTime',
                label: getIntlText('common.label.create_time'),
                content: getTimeFormat(data?.createdAt),
            },
            {
                key: 'founder',
                label: getIntlText('device.label.param_founder'),
                content:
                    loading !== false
                        ? ''
                        : data?.userNickname || getIntlText('common.label.system'),
            },
            {
                key: 'id',
                label: getIntlText('device.label.param_device_id'),
                content: data?.id,
            },
        ];
    }, [data, loading, getIntlText, getTimeFormat]);
    const handleDialogClose = useCallback(() => {
        setDialogOpen(false);
    }, []);

    // An instance that is exposed to the parent component
    useImperativeHandle(ref, () => {
        return {
            openEditDialog: () => {
                setDialogOpen(true);
            },
        };
    });

    return (
        <div className="ms-com-device-basic">
            <Descriptions data={descList} loading={loading} />
            <EditDialog
                visible={dialogOpen}
                data={data}
                onCancel={handleDialogClose}
                onError={handleDialogClose}
                onSuccess={() => {
                    handleDialogClose();
                    onEditSuccess?.();
                }}
            />
        </div>
    );
};

const ForwardBasicTable = (forwardRef as FixedForwardRef)<BasicTableInstance, Props>(BasicTable);

export default ForwardBasicTable;
