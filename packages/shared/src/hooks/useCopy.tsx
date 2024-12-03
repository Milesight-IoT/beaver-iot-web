import { useCallback } from 'react';
import toast from '../components/toast';
import useI18n from './useI18n';
import { copyText } from '../utils/clipboard';

/**
 * 通用文案复制逻辑
 */
const useCopy = () => {
    const { getIntlText } = useI18n();
    const handleCopy = useCallback(
        async (text: string) => {
            if (!text) return;
            const res = await copyText(text);
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
