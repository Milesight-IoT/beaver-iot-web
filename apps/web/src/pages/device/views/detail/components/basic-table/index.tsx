import { useCallback, useMemo, useState, forwardRef, useImperativeHandle } from 'react';
import { Stack, IconButton } from '@mui/material';
import { useI18n, useTime } from '@milesight/shared/src/hooks';
import { EditIcon } from '@milesight/shared/src/components';
import { Descriptions, Tooltip } from '@/components';
import { type DeviceAPISchema } from '@/services/http';
import EditDialog from './edit-dialog';

interface Props {
    /** 是否加载中 */
    loading?: boolean;

    /** 设备详情 */
    data?: ObjectToCamelCase<DeviceAPISchema['getDetail']['response']>;

    /** 编辑成功回调 */
    onEditSuccess?: () => void;
}

export interface BasicTableInstance {
    /** 打开编辑弹窗 */
    openEditDialog: () => void;
}

/**
 * 设备基本信息表格
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
                        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                    >
                        <Tooltip autoEllipsis title={data?.name} />
                        <IconButton
                            sx={{ width: 22, height: 22 }}
                            onClick={() => {
                                setDialogOpen(true);
                            }}
                        >
                            <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
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
                label: getIntlText('device.label.param_source'),
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
                content: data?.integrationName,
            },
            {
                key: 'id',
                label: getIntlText('device.label.param_device_id'),
                content: data?.id,
            },
        ];
    }, [data, getIntlText, getTimeFormat]);
    const handleDialogClose = useCallback(() => {
        setDialogOpen(false);
    }, []);

    // 暴露给父组件的实例
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
