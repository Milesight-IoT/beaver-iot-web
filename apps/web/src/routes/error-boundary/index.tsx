import { useRouteError } from 'react-router-dom';
import { CssBaseline, Button, Stack } from '@mui/material';
import { useCopy, useI18n } from '@milesight/shared/src/hooks';
import { Logo } from '@milesight/shared/src/components';
import './style.less';
import React from 'react';

interface Props {
    /** Whether to display inline */
    inline?: boolean;

    /** Callback function */
    callback?: () => void;
}

/**
 * Route rendering error prompt component
 */
const ErrorBoundary: React.FC<Props> = ({ inline, callback }) => {
    const error = useRouteError() as any;
    const { handleCopy } = useCopy();
    const { getIntlText } = useI18n();

    return (
        <div className="ms-layout">
            <CssBaseline />
            <div className="ms-view-error">
                {!inline && <Logo />}
                <div className="ms-route-error">
                    <h2 className="ms-route-error-title">
                        {getIntlText('common.message.something_wrong_title')}
                    </h2>
                    {error?.message && (
                        <span className="ms-route-error-message">{error.message}</span>
                    )}
                    {error?.stack && <pre className="ms-route-error-pre">{error.stack}</pre>}
                    <Stack direction="row" spacing={2}>
                        {error?.stack && (
                            <Button variant="outlined" onClick={() => handleCopy(error.stack)}>
                                {getIntlText('common.label.copy_error_info')}
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            onClick={() => {
                                if (callback) {
                                    callback();
                                    return;
                                }

                                window.location.reload();
                            }}
                        >
                            {getIntlText('common.label.click_to_try_fix')}
                        </Button>
                    </Stack>
                </div>
            </div>
        </div>
    );
};

export default ErrorBoundary;
