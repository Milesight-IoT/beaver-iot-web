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
     * 取消按钮文字
     */
    onCancelText?: string;
    /**
     * 确认按钮文字
     */
    onOkText?: string;
    /**
     * 是否显示弹框
     */
    visible?: boolean;
    /**
     * 弹框标题
     */
    title?: string;
    /**
     * 自定义弹框宽度
     * @description 有值是size属性不生效
     */
    width?: string;
    /**
     * 弹框尺寸
     * @description 选值：small(200px)、medium(450px)、large(600px)、full(100%)
     */
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /**
     * 弹框类名
     */
    className?: string;
    /**
     * 是否禁止点击遮罩层关闭弹框
     */
    disabledBackdropClose?: boolean;
    /**
     * 弹框内容
     */
    children?: React.ReactNode;
    /**
     * 外部传入的样式
     */
    sx?: DialogProps['sx'];
    /**
     * 确认按钮回调
     */
    onOk?: () => void;

    /**
     * 取消按钮回调
     */
    onCancel: () => void;

    /**
     * 挂载节点
     */
    container?: HTMLDivElement;

    /**
     * 自定义页脚
     */
    footer?: React.ReactNode;
    /**
     * 是否显示右上角关闭图标，默认false
     */
    showCloseIcon?: boolean;
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
        >
            {!!title && (
                <DialogTitle sx={{ m: 0, paddingX: 3, paddingY: 2 }} id="customized-dialog-title">
                    {title}
                </DialogTitle>
            )}
            {showCloseIcon && (
                <IconButton
                    aria-label="close"
                    onClick={handleCloseIcon as any}
                    sx={theme => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CloseIcon />
                </IconButton>
            )}
            <DialogContent>{children}</DialogContent>
            {footer === undefined ? (
                <DialogActions className="ms-modal-footer">
                    <Button
                        variant="outlined"
                        disabled={loading}
                        onClick={onCancel}
                        sx={{ mr: 1, '&:last-child': { mr: 0 } }}
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
