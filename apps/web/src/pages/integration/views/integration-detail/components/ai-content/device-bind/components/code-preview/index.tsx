import React, { memo } from 'react';
import { Popover, IconButton } from '@mui/material';
import { usePopupState, bindTrigger, bindPopover } from 'material-ui-popup-state/hooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { CodeIcon } from '@milesight/shared/src/components';
import { CodeEditor, Tooltip } from '@/components';
import './style.less';

interface Props {
    /** Popover ID */
    id: ApiKey;
    /** Code content */
    content: string;
}

/**
 *  Code preview component
 */
const CodePreview: React.FC<Props> = memo(({ id, content }) => {
    const { getIntlText } = useI18n();
    const popupState = usePopupState({ variant: 'popover', popupId: `${id}` });

    return (
        <>
            <Tooltip
                className="ms-com-code-preview"
                title={getIntlText('setting.integration.ai_click_to_view_infer_result')}
            >
                <IconButton {...bindTrigger(popupState)}>
                    <CodeIcon />
                </IconButton>
            </Tooltip>
            <Popover
                {...bindPopover(popupState)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <div className="ms-com-code-preview-code">
                    <CodeEditor
                        editorLang="json"
                        editable={false}
                        title={getIntlText('common.label.json')}
                        value={content}
                    />
                </div>
            </Popover>
        </>
    );
});

export default CodePreview;
