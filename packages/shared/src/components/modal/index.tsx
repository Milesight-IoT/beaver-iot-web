import { useMemo, useState } from 'react';
import cls from 'classnames';
import { useMemoizedFn } from 'ahooks';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    type DialogProps,
} from '@mui/material';
import useI18n from '../../hooks/useI18n';
import LoadingButton from '../loading-button';
import { CloseIcon } from '../icons';
import './style.less';

export interface ModalProps {
    /**
     * Cancel button text
     */
    onCancelText?: string;
    /**
     * Confirm the button text
     */
    onOkText?: string;
    /**
     * Whether to display a bomb frame
     */
    visible?: boolean;
    /**
     * Bomber title
     */
    title?: string | React.ReactNode;
    /**
     * Custom bomb frame width
     * @description Value is that the size attribute does not take effect
     */
    width?: string;
    /**
     * Bullet size
     * @description Value selection：small(200px)、medium(450px)、large(600px)、full(100%)
     */
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /**
     * Bombs
     */
    className?: string;
    /**
     * Whether to prohibit click the mask layer to close the bullet frame
     */
    disabledBackdropClose?: boolean;
    /**
     * Bomber content
     */
    children?: React.ReactNode;
    /**
     * External passing style
     */
    sx?: DialogProps['sx'];
    /**
     * Confirm the button back
     */
    onOk?: () => void;

    /**
     * Cancel the button back
     */
    onCancel: () => void;

    /**
     * Mount node
     */
    container?: HTMLDivElement;

    /**
     * Customized
     */
    footer?: React.ReactNode;
    /**
     * Whether the icon is turned off in the upper right corner, the default FALSE
     */
    showCloseIcon?: boolean;
    /**
     * Disable the scroll lock behavior.
     */
    disableScrollLock?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    size,
    title,
    width,
    visible,
    onOkText,
    onCancelText,
    className,
    sx,
    onOk,
    onCancel,
    container,
    footer,
    children,
    disabledBackdropClose = true,
    showCloseIcon = false,
    disableScrollLock = false,
}) => {
    const { getIntlText } = useI18n();
    const [loading, setLoading] = useState<boolean>();

    const ModalWidth = useMemo(() => {
        if (width) {
            return width;
        }
        if (size) {
            switch (size) {
                case 'sm':
                    return '200px';
                case 'md':
                    return '450px';
                case 'lg':
                    return '600px';
                case 'xl':
                    return '800px';
                case 'full':
                    return '100%';
                default:
                    return '450px';
            }
        }
        return '450px';
    }, [width, size]);

    const handleClose = useMemoizedFn<NonNullable<DialogProps['onClose']>>((_, reason) => {
        if (disabledBackdropClose && reason === 'backdropClick') return;
        onCancel();
    });

    const handleOk = useMemoizedFn(async () => {
        setLoading(true);
        await onOk?.();
        setLoading(false);
    });

    const handleCloseIcon = () => {
        onCancel();
    };

    return (
        <Dialog
            aria-labelledby="customized-dialog-title"
            className={cls('ms-modal-root', className, { loading })}
            open={!!visible}
            onClose={handleClose}
            container={container}
            sx={{ '& .MuiDialog-paper': { width: ModalWidth, maxWidth: 'none' }, ...(sx || {}) }}
            disableScrollLock={disableScrollLock}
        >
            {!!title &&
                (typeof title === 'string' ? (
                    <DialogTitle
                        id="customized-dialog-title"
                        className="ms-modal-title"
                        sx={{ m: 0, paddingX: 3, paddingY: 2 }}
                    >
                        {title}
                    </DialogTitle>
                ) : (
                    title
                ))}
            {showCloseIcon && (
                <IconButton
                    aria-label="close"
                    className="ms-modal-close-icon"
                    onClick={handleCloseIcon as any}
                >
                    <CloseIcon fontSize="inherit" />
                </IconButton>
            )}
            <DialogContent className="ms-modal-content">{children}</DialogContent>
            {footer === undefined ? (
                <DialogActions className="ms-modal-footer">
                    <Button
                        variant="outlined"
                        disabled={loading}
                        onClick={onCancel}
                        sx={{ mr: 0.5, '&:last-child': { mr: 0 } }}
                    >
                        {onCancelText || getIntlText('common.button.cancel')}
                    </Button>
                    <LoadingButton
                        variant="contained"
                        className="ms-modal-button"
                        loading={loading}
                        onClick={handleOk}
                    >
                        {onOkText || getIntlText('common.button.confirm')}
                    </LoadingButton>
                </DialogActions>
            ) : (
                footer
            )}
        </Dialog>
    );
};

export default Modal;
