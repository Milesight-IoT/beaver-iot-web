import {
    DialogProps as MUIDialogProps,
    ButtonProps,
    DialogTitleProps,
    TextFieldProps,
    DialogContentTextProps,
    DialogActionsProps,
    DialogContentProps,
    LinearProgressProps,
} from '@mui/material';

export type GlobalOptions = {
    /** Confirm Button Text */
    confirmButtonText?: string;
    /** Cancel Button Text */
    cancelButtonText?: string;
    /** Directly reject when clicking cancel */
    rejectOnCancel?: boolean;
    /** Disable Close when click the backdrop */
    disabledBackdropClose?: boolean;
    /** MUI Dialog Props */
    dialogProps?: Omit<MUIDialogProps, 'open' | 'onClose'>;
    /** MUI DialogTitle Props */
    dialogTitleProps?: DialogTitleProps;
    /** MUI DialogContent Props */
    dialogContentProps?: DialogContentProps;
    /** MUI DialogContentText Props */
    dialogContentTextProps?: DialogContentTextProps;
    /** MUI DialogActions Props */
    dialogActionsProps?: DialogActionsProps;
    /** MUI TextField Props */
    confirmTextFieldProps?: Omit<TextFieldProps, 'onChange' | 'value'>;
    /** MUI LinearProgress Props */
    timerProgressProps?: Partial<LinearProgressProps>;
    /** Confirm Button Props */
    confirmButtonProps?: Omit<ButtonProps, 'onClick' | 'disabled'>;
    /** Cancel Button Props */
    cancelButtonProps?: Omit<ButtonProps, 'onClick'>;
};

export type ConfirmOptions = GlobalOptions & {
    /** Icon */
    icon?: React.ReactNode;
    /** Type */
    type?: 'success' | 'error' | 'warning' | 'info';
    /** Title */
    title: string;
    /** Description */
    description?: React.ReactNode;
    /** Confirm Text to input */
    confirmText?: string;
    /** Automatically turn off countdown (ms) */
    timer?: number;
    /** Confirm Callback */
    onConfirm?: () => Promise<void> | void;
};

export type FinalOptions = Partial<GlobalOptions & ConfirmOptions>;

export type HandleConfirm = (options?: ConfirmOptions) => void | Promise<void>;

export type DialogProps = {
    show: boolean;
    finalOptions: FinalOptions;
    progress: number;
    onCancel: () => void;
    onClose: () => void;
    onConfirm: () => Promise<void>;
};

export type UseTimerProps = {
    onTimeEnd?: () => void;
    onTimeTick?: (timeLeft: number) => void;
};
