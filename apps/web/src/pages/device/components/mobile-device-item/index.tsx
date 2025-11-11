import React, { memo, useMemo } from 'react';
import { useI18n } from '@milesight/shared/src/hooks';
import { PERMISSIONS } from '@/constants';
import { Tooltip, MoreMenu, DeviceStatus, PermissionControlHidden } from '@/components';
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
export const DEVICE_ITEM_HEIGHT = 142;

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
                    <DeviceStatus type={data.status} />
                    <PermissionControlHidden permissions={[PERMISSIONS.DEVICE_DELETE]}>
                        <MoreMenu
                            key={data.id}
                            options={moreMenuOptions}
                            onClick={menu => onAction?.(menu.value, data)}
                        />
                    </PermissionControlHidden>
                </div>
            </div>
            <div className="ms-mobile-device-item__body">
                <div className="ms-mobile-device-item__info">
                    <div className="ms-mobile-device-item__info-label">
                        {getIntlText('device.label.param_external_id')}
                    </div>
                    <div className="ms-mobile-device-item__info-value">
                        <Tooltip autoEllipsis title={data.identifier} />
                    </div>
                    <div className="ms-mobile-device-item__info-label">
                        {getIntlText('device.label.device_group')}
                    </div>
                    <div className="ms-mobile-device-item__info-value">
                        <Tooltip autoEllipsis title={data.group_name || '-'} />
                    </div>
                    <div className="ms-mobile-device-item__info-label">
                        {getIntlText('common.label.location')}
                    </div>
                    <div className="ms-mobile-device-item__info-value">
                        <Tooltip
                            autoEllipsis
                            title={
                                !data.location
                                    ? '-'
                                    : `${data.location.latitude}, ${data.location.longitude}`
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default MobileDeviceItem;
