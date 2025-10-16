import React from 'react';
import { Checkbox, Avatar } from '@mui/material';
import { isEmpty } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';
import {
    LoadingWrapper,
    UncheckedCheckboxIcon,
    CheckedCheckboxIcon,
    DisabledCheckboxIcon,
    DnsIcon,
} from '@milesight/shared/src/components';

import { Tooltip, Empty } from '@/components';
import { type DeviceDetail } from '@/services/http';
import { useAllChecked, useSingleChecked } from './hooks';

import styles from './style.module.less';

export interface GroupDetailProps {
    loading?: boolean;
    data?: DeviceDetail[];
}

const GroupDetail: React.FC<GroupDetailProps> = props => {
    const { loading, data } = props;

    const { getIntlText } = useI18n();
    const { allIsChecked, allIsIndeterminate, allIsDisabled, handleAllCheckedChange } =
        useAllChecked(data);
    const { isChecked, isDisabled, handleCheckedChange } = useSingleChecked();

    const renderCheckbox = (item: DeviceDetail) => {
        const disabled = isDisabled(item);

        const CheckboxNode = (
            <Checkbox
                icon={
                    disabled ? (
                        <DisabledCheckboxIcon sx={{ width: '20px', height: '20px' }} />
                    ) : (
                        <UncheckedCheckboxIcon sx={{ width: '20px', height: '20px' }} />
                    )
                }
                checkedIcon={<CheckedCheckboxIcon sx={{ width: '20px', height: '20px' }} />}
                disabled={disabled}
                indeterminate={false}
                checked={isChecked(item)}
                sx={{
                    padding: 0,
                    color: 'var(--text-color-tertiary)',
                }}
                onChange={(_, checked) => handleCheckedChange(checked, item)}
            />
        );

        if (disabled) {
            return (
                <Tooltip title={getIntlText('common.tip.cannot_selected')}>
                    <div>{CheckboxNode}</div>
                </Tooltip>
            );
        }

        return CheckboxNode;
    };

    const renderDeviceItem = (item: DeviceDetail) => {
        return (
            <div key={item.key} className={styles['device-item']}>
                {renderCheckbox(item)}
                <Avatar>
                    <DnsIcon />
                </Avatar>
                <div className={styles.info}>
                    <Tooltip autoEllipsis title={item.name} />
                    <div className={styles.description}>
                        <Tooltip
                            autoEllipsis
                            title={
                                item?.group_name
                                    ? `${getIntlText('device.label.param_external_id')}: ${item.identifier}, ${item.group_name}`
                                    : `${getIntlText('device.label.param_external_id')}: ${item.identifier}`
                            }
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderAllCheckbox = () => {
        const CheckboxNode = (
            <Checkbox
                icon={
                    allIsDisabled ? (
                        <DisabledCheckboxIcon sx={{ width: '20px', height: '20px' }} />
                    ) : (
                        <UncheckedCheckboxIcon sx={{ width: '20px', height: '20px' }} />
                    )
                }
                checkedIcon={<CheckedCheckboxIcon sx={{ width: '20px', height: '20px' }} />}
                disabled={allIsDisabled}
                indeterminate={allIsIndeterminate}
                checked={allIsChecked}
                sx={{
                    padding: 0,
                    color: 'var(--text-color-tertiary)',
                }}
                onChange={(_, checked) => handleAllCheckedChange(checked)}
            />
        );

        if (allIsDisabled) {
            return (
                <Tooltip title={getIntlText('common.tip.cannot_selected')}>
                    <div>{CheckboxNode}</div>
                </Tooltip>
            );
        }

        return CheckboxNode;
    };

    return (
        <div className={styles['group-detail']}>
            <LoadingWrapper loading={loading}>
                <div className={styles['group-detail__container']}>
                    {Array.isArray(data) && !isEmpty(data) && (
                        <div className={styles['check-all']}>
                            {renderAllCheckbox()}

                            <div className={styles.title}>
                                {getIntlText('common.label.select_page_all')}
                            </div>
                        </div>
                    )}

                    {(data || []).map(d => renderDeviceItem(d))}

                    {(!Array.isArray(data) || isEmpty(data)) && (
                        <Empty text={getIntlText('common.label.empty')} />
                    )}
                </div>
            </LoadingWrapper>
        </div>
    );
};

export default GroupDetail;
