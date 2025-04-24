import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { Modal, type ModalProps } from '@milesight/shared/src/components';
import { useI18n } from '@milesight/shared/src/hooks';
import { Empty } from '@/components';
import { LogItem, LogRightBar } from './components';
import { useRenderList, useSourceData } from './hooks';
import type { LogRenderListType, WorkflowData } from './types';
import './style.less';

export interface IProps extends ModalProps {
    data: WorkflowData;
}
export default React.memo(({ visible, data, ...props }: IProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const { getIntlText } = useI18n();
    const [activeItem, setActiveItem] = useState<LogRenderListType>();

    const { getLogList } = useSourceData({ data });
    const { scrollItem, virtualList, getLogListLoading } = useRenderList({
        containerRef,
        listRef,
        getLogList,
    });

    /** When initializing, set the first as the default value */
    useEffect(() => {
        if (activeItem) return;

        const [firstItem] = scrollItem?.list || [];
        setActiveItem(firstItem);
    }, [scrollItem, activeItem]);

    /** handle click left bar */
    const handleClick = useCallback((data: LogRenderListType) => {
        setActiveItem(data);
    }, []);

    const isLoading = !!getLogListLoading;
    const isEmpty = !getLogListLoading && !scrollItem?.list?.length;
    return (
        <Modal
            size="xl"
            footer={null}
            showCloseIcon
            visible={visible}
            title={getIntlText('workflow.modal.running_log')}
            className="ms-log-modal"
            {...props}
        >
            <div className="ms-log-container">
                <div style={{ display: isLoading ? 'block' : 'none' }}>
                    <div className="ms-log-loading ms-log-flotage">
                        <CircularProgress />
                    </div>
                </div>
                {isEmpty && (
                    <div className="ms-log-empty">
                        <Empty text={getIntlText('workflow.label.no_log_record')} />
                    </div>
                )}
                {!isEmpty && (
                    <>
                        <div className="ms-log-left-bar">
                            <div
                                className="ms-log-left-bar__scroll ms-perfect-scrollbar"
                                ref={containerRef}
                            >
                                <div className="ms-log-left-bar__list" ref={listRef}>
                                    {virtualList.map(({ data }) => {
                                        if (data?.$$isFooterNode) {
                                            return (
                                                <div className="ms-log-left-bar__more">
                                                    <CircularProgress size={22} />
                                                </div>
                                            );
                                        }
                                        return (
                                            <LogItem
                                                data={data}
                                                key={data.id}
                                                isActive={data.id === activeItem?.id}
                                                onClick={handleClick}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <LogRightBar data={data} activeItem={activeItem} />
                    </>
                )}
            </div>
        </Modal>
    );
});
