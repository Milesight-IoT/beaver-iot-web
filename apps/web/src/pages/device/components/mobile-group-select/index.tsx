import React, { memo, useState, useMemo, useLayoutEffect } from 'react';
import cls from 'classnames';
import { useRequest, useControllableValue } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal, KeyboardArrowDownIcon } from '@milesight/shared/src/components';
import { Tooltip } from '@/components';
import {
    deviceAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    type DeviceGroupItemProps,
} from '@/services/http';
import useDeviceStore from '../../store';
import { FixedGroupEnum } from '../../constants';
import './style.less';

export type GroupItem = PartialOptional<DeviceGroupItemProps, 'name'>;

export interface Props {
    value?: GroupItem;
    onChange?: (value: GroupItem) => void;
}

const ALL_DEVICE_ITEM = {
    id: FixedGroupEnum.ALL,
    nameIntlKey: 'device.label.all_devices',
};

/**
 * Group selector for mobile
 */
const MobileGroupSelect: React.FC<Props> = memo(props => {
    const { getIntlText } = useI18n();

    const [value, setValue] = useControllableValue<Props['value']>(props);
    const [open, setOpen] = useState(false);

    // ---------- Render Group List ----------
    const { deviceGroups, updateDeviceGroups, updateActiveGroup } = useDeviceStore();
    const { run: getDeviceGroups } = useRequest(
        async () => {
            const [error, resp] = await awaitWrap(
                deviceAPI.getDeviceGroupList({
                    page_number: 1,
                    page_size: 100,
                }),
            );

            if (error || !isRequestSuccess(resp)) return;
            const groups = getResponseData(resp)?.content || [];

            updateDeviceGroups(groups);
            return groups;
        },
        {
            debounceWait: 300,
        },
    );
    const defaultGroupItem = useMemo(
        () => ({
            id: ALL_DEVICE_ITEM.id,
            name: getIntlText(ALL_DEVICE_ITEM.nameIntlKey),
        }),
        [getIntlText],
    );
    const options = useMemo(() => {
        const result: GroupItem[] = [defaultGroupItem];

        deviceGroups?.forEach(item => {
            result.push({
                id: item.id,
                name: item.name,
            });
        });

        return result;
    }, [deviceGroups, defaultGroupItem]);

    // Refresh device groups when open modal
    useLayoutEffect(() => {
        if (!open) return;
        getDeviceGroups();
    }, [open, getDeviceGroups]);

    // ---------- Render Selected Group ----------
    const [selectedGroup, setSelectedGroup] = useState<GroupItem>();

    useLayoutEffect(() => {
        if (!value) {
            setSelectedGroup(defaultGroupItem);
            return;
        }

        setSelectedGroup(value);
    }, [open, value, defaultGroupItem, getIntlText]);

    return (
        <div className="ms-mobile-group-select">
            {selectedGroup && (
                <div className="trigger" onClick={() => setOpen(true)}>
                    <Tooltip autoEllipsis title={selectedGroup.name} />
                    <KeyboardArrowDownIcon />
                </div>
            )}
            <Modal
                className="ms-mobile-group-select-modal"
                title={getIntlText('device.label.select_group')}
                visible={open}
                onCancel={() => setOpen(false)}
                onOk={() => {
                    setOpen(false);
                    setValue(selectedGroup);
                }}
            >
                <div className="group-list">
                    {options.map(item => (
                        <div
                            key={item.id}
                            className={cls('group-item', { active: selectedGroup?.id === item.id })}
                            onClick={() => setSelectedGroup(item)}
                        >
                            <Tooltip autoEllipsis title={item.name} />
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
});

export default MobileGroupSelect;
