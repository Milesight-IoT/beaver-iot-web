import React from 'react';
import cls from 'classnames';
import { useI18n } from '@milesight/shared/src/hooks';
import { type InferStatus } from '@/services/http';
import './style.less';

interface Props {
    status: InferStatus;
}

const statusIntlMap: Record<InferStatus, string> = {
    Ok: 'common.label.normal',
    Failed: 'common.label.abnormal',
};

const StatusTag: React.FC<Props> = ({ status }) => {
    const { getIntlText } = useI18n();

    return (
        <span className={cls('ms-ai-infer-status-tag', status.toLocaleLowerCase())}>
            {statusIntlMap[status] ? getIntlText(statusIntlMap[status]) : status}
        </span>
    );
};

export default StatusTag;
