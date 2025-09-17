import React, { useEffect, useState } from 'react';
import { FormHelperText } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal, ExitToAppIcon } from '@milesight/shared/src/components';
import { curl2Json, type Result as ParseResult } from '@milesight/shared/src/utils/curl-parser';
import { CodeEditor } from '@/components';

import './style.less';

export interface HttpCurlDialogProps {
    onChange?: (data: ParseResult) => void;
}

const MAX_IMPORT_CURL_LEN = 1000;

const HttpCurlDialog: React.FC<HttpCurlDialogProps> = ({ onChange }) => {
    const { getIntlText } = useI18n();
    const [visible, setVisible] = useState(false);
    const [error, setError] = useState<string>('');
    const [content, setContent] = useState('');
    const handleConfirm = () => {
        if (!content) return;
        if (content.length > MAX_IMPORT_CURL_LEN) {
            setError(getIntlText('valid.input.max_length', { 1: MAX_IMPORT_CURL_LEN }));
            return;
        }
        const result = curl2Json(content);
        setVisible(false);
        onChange?.(result);
    };

    // reset content when visible changes
    useEffect(() => {
        if (visible) return;
        setContent('');
    }, [visible]);

    return (
        <div className="ms-http-curl-import">
            <div className="ms-http-curl-import-trigger" onClick={() => setVisible(true)}>
                <ExitToAppIcon />
                {getIntlText('workflow.label.import_from_curl')}
            </div>
            <Modal
                size="lg"
                className="ms-http-curl-import-modal"
                visible={visible}
                title={getIntlText('workflow.label.import_from_curl')}
                okButtonProps={{
                    disabled: !content,
                }}
                onCancel={() => setVisible(false)}
                onOk={handleConfirm}
            >
                <CodeEditor
                    editorLang="text"
                    placeholder={getIntlText('workflow.label.placeholder_please_enter_curl')}
                    renderHeader={() => null}
                    value={content}
                    onChange={setContent}
                />
                {!!error && <FormHelperText error>{error}</FormHelperText>}
            </Modal>
        </div>
    );
};

export default HttpCurlDialog;
