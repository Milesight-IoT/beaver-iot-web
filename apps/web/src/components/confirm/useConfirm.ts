import React from 'react';
import { ConfirmContext } from './confirm-provider';

/**
 * Confirm Hook based MUI Dialog component
 *
 * @example
 * const confirm = useConfirm(options);
 * const handleClick = () => {
 *   confirm({
 *     title: 'Are you sure you want to delete?',
 *   });
 * }
 */
export const useConfirm = () => {
    const confirm = React.useContext(ConfirmContext);

    if (!confirm) throw new Error('useConfirm must be used within a ConfirmProvider');

    return confirm;
};
