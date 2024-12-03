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
    /** 确认按钮文案 */
    confirmButtonText?: string;
    /** 取消按钮文案 */
    cancelButtonText?: string;
    /** 点击取消时直接 reject */
    rejectOnCancel?: boolean;
    /** 禁用背景蒙层点击关闭功能 */
    disabledBackdropClose?: boolean;
    /** MUI Dialog 组件属性 */
    dialogProps?: Omit<MUIDialogProps, 'open' | 'onClose'>;
    /** MUI DialogTitle 组件属性 */
    dialogTitleProps?: DialogTitleProps;
    /** MUI DialogContent 组件属性 */
    dialogContentProps?: DialogContentProps;
    /** MUI DialogContentText 组件属性 */
    dialogContentTextProps?: DialogContentTextProps;
    /** MUI DialogActions 组件属性 */
    dialogActionsProps?: DialogActionsProps;
    /** MUI TextField 组件属性 */
    confirmTextFieldProps?: Omit<TextFieldProps, 'onChange' | 'value'>;
    /** MUI LinearProgress 组件属性 */
    timerProgressProps?: Partial<LinearProgressProps>;
    /** 确认按钮组件属性 */
    confirmButtonProps?: Omit<ButtonProps, 'onClick' | 'disabled'>;
    /** 取消按钮组件属性 */
    cancelButtonProps?: Omit<ButtonProps, 'onClick'>;
};

export type ConfirmOptions = GlobalOptions & {
    /** 图标 */
    icon?: React.ReactNode;
    /** 标题 */
    title: string;
    /** 描述 */
    description?: React.ReactNode;
    /** 输入确认文案 */
    confirmText?: string;
    /** 自动关闭倒计时，单位 ms */
    timer?: number;
    /** 点击确认按钮回调 */
    onConfirm?: () => Promise<void> | void;
};

export type FinalOptions = Partial<GlobalOptions & ConfirmOptions>;

export type HandleConfirm = (options?: ConfirmOptions) => void;

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
