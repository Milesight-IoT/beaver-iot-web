import { useEffect, useMemo, useState } from 'react';
import cls from 'classnames';
import { useMemoizedFn } from 'ahooks';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    type DialogProps,
    type ButtonProps,
} from '@mui/material';
import { type TransitionProps } from '@mui/material/transitions';

import { isUndefined } from 'lodash-es';
import useI18n from '../../hooks/useI18n';
import useTheme from '../../hooks/useTheme';
import LoadingButton, { type LoadingButtonProps } from '../loading-button';
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
     * Whether to display in full screen
     */
    fullScreen?: boolean;
    /**
     * Bombs
     */
    className?: string;
    /**
     * Whether to keep the modal mounted when hidden
     */
    keepMounted?: boolean;
    /**
     * If `true`, hitting escape will not fire the `onClose` callback.
     * @default false
     */
    disableEscapeKeyDown?: DialogProps['disableEscapeKeyDown'];
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

    /**
     * Confirm button props
     */
    okButtonProps?: LoadingButtonProps;

    /**
     * Cancel button props
     */
    cancelButtonProps?: LoadingButtonProps;

    /**
     * Dialog transition props
     */
    transitionProps?: TransitionProps;
}

const Modal: React.FC<ModalProps> = ({
    size,
    title,
    width,
    visible,
    fullScreen,
    onOkText,
    onCancelText,
    className,
    keepMounted,
    sx,
    onOk,
    onCancel,
    container,
    footer,
    children,
    disableEscapeKeyDown = false,
    disabledBackdropClose = true,
    showCloseIcon,
    disableScrollLock = false,
    okButtonProps,
    cancelButtonProps,
    transitionProps,
}) => {
    const { getIntlText } = useI18n();
    const [loading, setLoading] = useState<boolean>();

    // ---------- FullScreen ----------
    const { matchTablet } = useTheme();
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        if (matchTablet) {
            setIsFullScreen(true);
            return;
        }
        setIsFullScreen(!!fullScreen);
    }, [fullScreen, matchTablet]);

    // ---------- Render Modal ----------
    const closable = !isUndefined(showCloseIcon) ? showCloseIcon : matchTablet;
    const modalWidth = useMemo(() => {
        if (isFullScreen) return '100%';
        if (width) return width;

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
    }, [width, size, isFullScreen]);

    const handleClose = useMemoizedFn<NonNullable<DialogProps['onClose']>>((_, reason) => {
        if (disabledBackdropClose && reason === 'backdropClick') return;
        onCancel();
    });

    const handleOk = useMemoizedFn(async () => {
        setLoading(true);
        await onOk?.();
        setLoading(false);
    });

    return (
        <Dialog
            aria-labelledby="customized-dialog-title"
            className={cls('ms-modal-root', className, { loading })}
            open={!!visible}
            fullScreen={isFullScreen}
            keepMounted={keepMounted}
            onClose={handleClose}
            container={container}
            sx={{ '& .MuiDialog-paper': { width: modalWidth, maxWidth: 'none' }, ...(sx || {}) }}
            disableScrollLock={disableScrollLock}
            disableEscapeKeyDown={disableEscapeKeyDown}
            TransitionProps={transitionProps}
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
            {closable && (
                <IconButton
                    aria-label="close"
                    className="ms-modal-close-icon"
                    onClick={() => onCancel?.()}
                >
                    <CloseIcon fontSize="inherit" />
                </IconButton>
            )}
            <DialogContent className="ms-modal-content">{children}</DialogContent>
            {footer === undefined ? (
                <DialogActions className="ms-modal-footer">
                    <LoadingButton
                        {...cancelButtonProps}
                        variant="outlined"
                        disabled={loading || cancelButtonProps?.loading}
                        onClick={onCancel}
                        sx={{ mr: 0.5, '&:last-child': { mr: 0 } }}
                    >
                        {onCancelText || getIntlText('common.button.cancel')}
                    </LoadingButton>
                    <LoadingButton
                        {...okButtonProps}
                        variant="contained"
                        className="ms-modal-button"
                        loading={loading || okButtonProps?.loading}
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
