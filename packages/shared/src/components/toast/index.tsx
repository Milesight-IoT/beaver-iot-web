import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Snackbar, type SxProps } from '@mui/material';
import { isMobile } from '../../utils/userAgent';
import { InfoIcon, CheckCircleIcon, ErrorIcon, WarningIcon } from '../icons';
import './style.less';

type SeverityType = 'info' | 'success' | 'warning' | 'error';

interface Toast {
    key: ApiKey;
    duration: number | null;
    createAt: number;
    severity: SeverityType;
    content: React.ReactNode;
    onClose?: (event: Event | React.SyntheticEvent<any, Event>) => void;
}

type Params =
    | string
    | (PartialOptional<Omit<Toast, 'severity' | 'createAt'>, 'key' | 'duration'> & {
          container?: HTMLDivElement;
      });

const iconMap: Record<SeverityType, React.ReactNode> = {
    info: <InfoIcon />,
    success: <CheckCircleIcon />,
    warning: <WarningIcon />,
    error: <ErrorIcon />,
};

/**
 * Global message prompt box
 */
class ToastManager {
    private toasts: Toast[] = [];
    private root: Root | null = null;
    private container: HTMLDivElement;
    private maxNumber = 5;

    constructor() {
        this.container = document.createElement('div');
        this.root = createRoot(this.container);
        document.body.appendChild(this.container);
    }

    private renderToasts(container?: HTMLDivElement) {
        if (container) {
            this.root?.unmount();
            this.root = createRoot(container);
        }
        const style: SxProps | undefined = isMobile() ? { top: '38px' } : undefined;

        this.root?.render(
            <>
                {this.toasts.map(toast => (
                    <Snackbar
                        open
                        disableWindowBlurListener
                        className="ms-toast-container"
                        key={toast.key}
                        autoHideDuration={toast.duration}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        ClickAwayListenerProps={{
                            onClickAway: () => false,
                        }}
                        onClose={e => {
                            this.removeToast(toast.key);
                            toast.onClose?.(e);
                        }}
                        sx={style}
                    >
                        <div className={`ms-toast ${toast.severity}`}>
                            <div className="ms-toast-icon">{iconMap[toast.severity]}</div>
                            <div className="ms-toast-content">{toast.content}</div>
                        </div>
                    </Snackbar>
                ))}
            </>,
        );
    }

    private addToast({
        duration = 3000,
        key = Date.now(),
        container,
        ...props
    }: PartialOptional<Omit<Toast, 'createAt'>, 'key' | 'duration'> & {
        container?: HTMLDivElement;
    }) {
        const toast: Toast = { duration, key, createAt: Date.now(), ...props };

        this.toasts = this.toasts
            .filter(toast => {
                if (toast.key === key) return false;
                if (toast.duration === null) return true;
                return Date.now() - toast.createAt < toast.duration;
            })
            .slice(0, this.maxNumber - 1);
        this.toasts.push(toast);
        this.renderToasts(container);
    }

    private removeToast(key: ApiKey) {
        this.toasts = this.toasts.filter(toast => toast.key !== key);
        this.renderToasts();
    }

    info(props: Params) {
        const params = typeof props === 'string' ? { content: props } : props;
        this.addToast({ severity: 'info', ...params });
    }

    success(props: Params) {
        const params = typeof props === 'string' ? { content: props } : props;
        this.addToast({ severity: 'success', ...params });
    }

    warning(props: Params) {
        const params = typeof props === 'string' ? { content: props } : props;
        this.addToast({ severity: 'warning', ...params });
    }

    error(props: Params) {
        const params = typeof props === 'string' ? { content: props } : props;
        this.addToast({ severity: 'error', ...params });
    }
}

const toast = new ToastManager();
export default toast;
