import { useCallback } from 'react';
import toast from '../components/toast';
import useI18n from './useI18n';
import { copyText } from '../utils/clipboard';

/**
 * Common copy copy logic
 */
const useCopy = () => {
    const { getIntlText } = useI18n();
    const handleCopy = useCallback(
        async (text: string, container?: HTMLElement | null) => {
            if (!text) return;
            const res = await copyText(text, container || document.body);
            res &&
                toast.success({
                    key: 'copy',
                    content: getIntlText('common.message.copy_successful'),
                });
        },
        [getIntlText],
    );

    return {
        handleCopy,
    };
};

export default useCopy;
