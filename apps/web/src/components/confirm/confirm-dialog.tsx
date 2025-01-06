import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogTitle,
    DialogContent,
    DialogContentText,
    TextField,
    LinearProgress,
} from '@mui/material';
import cls from 'classnames';
import { LoadingButton } from '@milesight/shared/src/components';
import { DialogProps } from './types';
import { defaultGlobalOptions } from './default-options';
import './style.less';

const initialConfirmInputState = {
    value: '',
    isMatched: false,
};

export const ConfirmDialog: React.FC<DialogProps> = ({
    show,
    progress,
    onClose,
    onCancel,
    onConfirm,
    finalOptions,
}) => {
    const [confirmInput, setConfirmInput] = React.useState(initialConfirmInputState);
    const [loading, setLoading] = React.useState(false);

    const className = cls(finalOptions.dialogProps?.className, 'ms-confirm', {
        [`ms-confirm-${finalOptions.type}`]: finalOptions.type,
        'ms-confirm-with-icon': finalOptions.icon,
        'ms-confirm-without-title': !finalOptions.title && !finalOptions.icon,
    });
    const isConfirmDisabled = Boolean(!confirmInput.isMatched && finalOptions?.confirmText);

    const handleConfirm = React.useCallback(async () => {
        try {
            if (isConfirmDisabled) return;
            setLoading(true);
            await onConfirm();
            setConfirmInput(initialConfirmInputState);
        } catch (error) {
            console.warn(error);
        } finally {
            setLoading(false);
        }
    }, [isConfirmDisabled, onConfirm]);

    const handleCancelOnClose = React.useCallback((handler: () => void) => {
        handler();
        setLoading(false);
        setConfirmInput(initialConfirmInputState);
    }, []);

    const handleConfirmInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.currentTarget.value;

        setConfirmInput({
            value: inputValue,
            isMatched: finalOptions?.confirmText === inputValue,
        });
    };
    return (
        <Dialog
            {...finalOptions.dialogProps}
            open={show}
            className={className}
            onClose={(_, reason) => {
                if (finalOptions.disabledBackdropClose && reason === 'backdropClick') return;
                handleCancelOnClose(onClose);
            }}
        >
            {progress > 0 && (
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    {...finalOptions.timerProgressProps}
                />
            )}
            <DialogTitle {...finalOptions.dialogTitleProps}>
                {!!(finalOptions.icon || finalOptions.title) && (
                    <div className="ms-confirm-title">
                        {!!finalOptions.icon && (
                            <span className="ms-confirm-icon">{finalOptions.icon}</span>
                        )}
                        {finalOptions.title!}
                    </div>
                )}
            </DialogTitle>
            <DialogContent {...finalOptions.dialogContentProps}>
                {finalOptions?.description && (
                    <DialogContentText {...finalOptions.dialogContentTextProps}>
                        {finalOptions?.description}
                    </DialogContentText>
                )}
                {finalOptions?.confirmText && (
                    <TextField
                        autoFocus
                        fullWidth
                        {...finalOptions.confirmTextFieldProps}
                        onChange={handleConfirmInput}
                        value={confirmInput.value}
                    />
                )}
            </DialogContent>
            <DialogActions {...finalOptions.dialogActionsProps}>
                <Button
                    disabled={loading}
                    {...finalOptions.cancelButtonProps}
                    onClick={() => handleCancelOnClose(onCancel)}
                >
                    {finalOptions?.cancelButtonText || defaultGlobalOptions.cancelButtonText}
                </Button>
                <LoadingButton
                    {...finalOptions.confirmButtonProps}
                    loading={loading}
                    disabled={isConfirmDisabled}
                    onClick={handleConfirm}
                >
                    {finalOptions?.confirmButtonText || defaultGlobalOptions.confirmButtonText}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
};
