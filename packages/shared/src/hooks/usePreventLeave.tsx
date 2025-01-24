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
 * Pop-up message indicating route blocking
 */
const usePreventLeave = (props: PreventLeaveProps) => {
    const { getIntlText } = useI18n();
    const { isPreventLeave, confirm } = props;
    const blocker = useBlocker(isPreventLeave);

    const showPrevent = (params: showPreventProps) => {
        const { onOk, onCancel } = params;
        confirm({
            type: 'info',
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

    // A pop-up message indicating that data is not saved
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
