import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import useI18n from './useI18n';

interface PreventLeaveProps {
    isPreventLeave: boolean;
    confirm: (data: any) => void;
}

interface showPreventProps {
    onOk?: () => void;
    onCancel?: () => void;
}

/**
 * 路由拦截弹窗提示
 */
const usePreventLeave = (props: PreventLeaveProps) => {
    const { getIntlText } = useI18n();
    const { isPreventLeave, confirm } = props;
    const blocker = useBlocker(isPreventLeave);

    const showPrevent = (params: showPreventProps) => {
        const { onOk, onCancel } = params;
        confirm({
            title: getIntlText('common.modal.title_leave_current_page'),
            description: getIntlText('common.modal.desc_leave_current_page'),
            confirmButtonText: getIntlText('common.button.confirm'),
            onConfirm: () => {
                onOk && onOk();
            },
            onCancel: () => {
                onCancel && onCancel();
            },
        });
    };

    // 数据未保存弹窗提示
    useEffect(() => {
        if (blocker.state === 'blocked') {
            showPrevent({
                onOk: blocker.proceed,
                onCancel: blocker.reset,
            });
        }
    }, [blocker, getIntlText]);

    return {
        showPrevent,
    };
};

export default usePreventLeave;
