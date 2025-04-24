import React from 'react';
import { CircularProgress } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { Empty, Tooltip } from '@/components';
import { useLogDetail } from './hooks';
import ActionLog from '../../../action-log';
import type { LogRenderListType, WorkflowData } from '../../types';
import './style.less';

export interface IProps {
    data: WorkflowData;
    activeItem?: LogRenderListType;
}
export default React.memo(({ activeItem, data }: IProps) => {
    const { getIntlText } = useI18n();
    const { actionLoading, traceData, workflowData } = useLogDetail({ activeItem, data });

    const isLoading = !!actionLoading;
    const isEmpty = !actionLoading && !workflowData;
    return (
        <div className="ms-log-right-bar ms-perfect-scrollbar">
            {isLoading && (
                <div className="ms-log-loading">
                    <CircularProgress />
                </div>
            )}
            {isEmpty && (
                <div className="ms-log-empty">
                    <Empty text={getIntlText('workflow.label.no_log_record')} />
                </div>
            )}
            {!isLoading && !isEmpty && (
                <>
                    <div className="ms-log-right-bar__title">
                        <Tooltip title={activeItem?.title || ''} autoEllipsis />
                    </div>
                    <div className="ms-log-right-bar__detail">
                        <ActionLog traceData={traceData} workflowData={workflowData!} />
                    </div>
                </>
            )}
        </div>
    );
});
