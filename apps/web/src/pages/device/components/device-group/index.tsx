import { useMemo, useImperativeHandle, forwardRef } from 'react';
import classNames from 'classnames';
import { useMemoizedFn } from 'ahooks';

import { LoadingWrapper } from '@milesight/shared/src/components';

import { type DeviceGroupItemProps } from '@/services/http/device';
import { Header, Body, OperateGroupModal } from './components';
import { MORE_OPERATION } from './components/more-dropdown';
import { useDeviceGroup, useGroupModal, useGroupCount } from './hooks';

import './style.less';

export interface DeviceGroupExposeProps {
    getDeviceGroups: (keyword?: string | undefined) => void;
}

export interface DeviceGroupProps {
    isShrink: boolean;
    /**
     * Refresh device list
     */
    refreshDeviceList?: () => void;
}

const DeviceGroup = forwardRef<DeviceGroupExposeProps, DeviceGroupProps>((props, ref) => {
    const { isShrink, refreshDeviceList } = props;

    const { groupCount, getDeviceGroupCount } = useGroupCount();

    const { getDeviceGroups, deviceGroups, loading, handleGroupDelete, keyword, changeKeyword } =
        useDeviceGroup(getDeviceGroupCount, refreshDeviceList);

    const {
        groupModalVisible,
        groupModalTitle,
        currentGroup,
        addGroupModal,
        hiddenGroupModal,
        onFormSubmit,
        editGroupModal,
    } = useGroupModal({
        getDeviceGroups,
        getDeviceGroupCount,
        refreshDeviceList,
    });

    // An instance that is exposed to the parent component
    useImperativeHandle(ref, () => {
        return {
            getDeviceGroups,
        };
    });

    const handleGroupOperation = useMemoizedFn(
        (type: MORE_OPERATION, record: DeviceGroupItemProps) => {
            if (type === MORE_OPERATION.RENAME) {
                editGroupModal?.(record);
            }

            if (type === MORE_OPERATION.DELETE) {
                handleGroupDelete?.(record);
            }
        },
    );

    const groupCls = useMemo(() => {
        return classNames('ms-device-group', {
            shrink: isShrink,
        });
    }, [isShrink]);

    const renderDeviceGroupBody = () => {
        if (!Array.isArray(deviceGroups) || loading) {
            return <LoadingWrapper loading wrapperClassName="ms-device-group__loading-wrapper" />;
        }

        return <Body deviceGroups={deviceGroups} onOperation={handleGroupOperation} />;
    };

    return (
        <div className={groupCls}>
            <Header
                onAdd={addGroupModal}
                keyword={keyword}
                changeKeyword={changeKeyword}
                groupCount={groupCount}
            />
            {renderDeviceGroupBody()}
            {groupModalVisible && (
                <OperateGroupModal
                    visible={groupModalVisible}
                    title={groupModalTitle}
                    data={currentGroup?.name}
                    onCancel={hiddenGroupModal}
                    onFormSubmit={onFormSubmit}
                />
            )}
        </div>
    );
});

export default DeviceGroup;
