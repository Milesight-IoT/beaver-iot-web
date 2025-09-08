import React, { memo, useMemo } from 'react';
import { Chip } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { Tooltip, MoreMenu } from '@/components';
import { type DeviceDetail } from '@/services/http';
import './style.less';

/**
 * Action type
 * @template delete Delete device
 */
export type ActionType = 'delete';

interface Props {
    /**
     * Device data
     */
    data: DeviceDetail;

    /**
     * Action callback
     */
    onAction?: (type: ActionType, device: DeviceDetail) => void;
}

/**
 * Device item height
 */
export const DEVICE_ITEM_HEIGHT = 116;

/**
 * Mobile device item
 */
const MobileDeviceItem: React.FC<Props> = memo(({ data, onAction }) => {
    const { getIntlText, mergeIntlText } = useI18n();

    const moreMenuOptions = useMemo(
        () => [
            {
                label: mergeIntlText(['common.label.delete', 'common.label.device']),
                value: 'delete' as const,
            },
        ],
        [mergeIntlText],
    );

    return (
        <div key={data.id} className="ms-mobile-device-item">
            <div className="ms-mobile-device-item__header">
                <div className="ms-mobile-device-item__name">
                    <Tooltip autoEllipsis title={data.name} />
                </div>
                <div className="ms-mobile-device-item__status">
                    <Chip className="status-online" label="Online" />
                    {/* <Chip className="status-offline" label="Offline" /> */}
                    <MoreMenu
                        options={moreMenuOptions}
                        onClick={menu => onAction?.(menu.value, data)}
                    />
                </div>
            </div>
            <div className="ms-mobile-device-item__body">
                <div className="ms-mobile-device-item__info">
                    <div className="ms-mobile-device-item__info-label">
                        {getIntlText('device.label.param_external_id')}
                    </div>
                    <div className="ms-mobile-device-item__info-value">
                        {/* TODO: Use External ID */}
                        <Tooltip autoEllipsis title={data.key} />
                    </div>
                    <div className="ms-mobile-device-item__info-label">
                        {getIntlText('device.label.device_group')}
                    </div>
                    <div className="ms-mobile-device-item__info-value">
                        <Tooltip autoEllipsis title={data.group_name || '-'} />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default MobileDeviceItem;
