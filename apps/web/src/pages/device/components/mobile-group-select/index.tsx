import React, { memo, useState, useMemo, useLayoutEffect } from 'react';
import cls from 'classnames';
import { useRequest, useControllableValue } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal, LoadingWrapper, KeyboardArrowDownIcon } from '@milesight/shared/src/components';
import { Tooltip } from '@/components';
import {
    deviceAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    type DeviceGroupItemProps,
} from '@/services/http';
import useDeviceStore from '../../store';
import { FIXED_GROUP } from '../../constants';
import './style.less';

export type GroupItem = DeviceGroupItemProps;

export interface Props {
    value?: GroupItem;
    onChange?: (value: GroupItem) => void;
}

/**
 * Group selector for mobile
 */
const MobileGroupSelect: React.FC<Props> = memo(props => {
    const { getIntlText } = useI18n();

    const [value, setValue] = useControllableValue<Props['value']>(props);
    const [open, setOpen] = useState(false);

    // ---------- Render Group List ----------
    const { deviceGroups, updateDeviceGroups, updateActiveGroup } = useDeviceStore();
    const [loading, setLoading] = useState<boolean>();
    const { run: getDeviceGroups } = useRequest(
        async () => {
            setLoading(true);
            const [error, resp] = await awaitWrap(
                deviceAPI.getDeviceGroupList({
                    page_number: 1,
                    page_size: 100,
                }),
            );

            setTimeout(() => setLoading(false), 0);
            if (error || !isRequestSuccess(resp)) return;
            const groups = getResponseData(resp)?.content || [];

            updateDeviceGroups(groups);
            return groups;
        },
        {
            debounceWait: 300,
        },
    );

    const options = useMemo(() => {
        const result: GroupItem[] = FIXED_GROUP.map(item => ({
            id: item.id,
            name: getIntlText(item.name),
        }));

        deviceGroups?.forEach(item => {
            result.push({
                id: item.id,
                name: item.name,
            });
        });

        return result;
    }, [deviceGroups, getIntlText]);

    // Refresh device groups when open modal
    useLayoutEffect(() => {
        if (!open) return;
        setLoading(true);
        getDeviceGroups();
    }, [open, getDeviceGroups]);

    // ---------- Render Selected Group ----------
    const [selectedGroup, setSelectedGroup] = useState<GroupItem>();

    // Initialize
    useLayoutEffect(() => {
        if (!value) {
            setSelectedGroup(options[0]);
            updateActiveGroup(options[0]);
            return;
        }
        const group = options.find(item => item.id === value.id);

        setSelectedGroup(group);
        updateActiveGroup(group);
    }, [open, value, options, getIntlText, updateActiveGroup]);

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
                    updateActiveGroup(
                        !selectedGroup
                            ? undefined
                            : { id: selectedGroup.id, name: selectedGroup.name || '' },
                    );
                }}
            >
                <LoadingWrapper loading={loading} wrapperClassName={cls('group-list', { loading })}>
                    {options.map(item => (
                        <div
                            key={item.id}
                            className={cls('group-item', { active: selectedGroup?.id === item.id })}
                            onClick={() => {
                                if (loading) return;
                                setSelectedGroup(item);
                            }}
                        >
                            <Tooltip autoEllipsis title={item.name} />
                        </div>
                    ))}
                </LoadingWrapper>
            </Modal>
        </div>
    );
});

export default MobileGroupSelect;
