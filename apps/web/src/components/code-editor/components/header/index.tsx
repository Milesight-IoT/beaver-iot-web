import React, { useCallback } from 'react';
import { ContentCopyIcon } from '@milesight/shared/src/components';
import { useCopy } from '@milesight/shared/src/hooks';
import EditorSelect from '../lang-select';
import type { EditorToolbarProps } from '../../types';
import './style.less';

export default React.memo(
    ({
        editorValue,
        editorLang,
        setEditorLang,
        icon,
        title,
        renderOptions,
    }: EditorToolbarProps) => {
        const { handleCopy } = useCopy();

        /** copy button callback */
        const handleCopyIcon = useCallback(() => {
            handleCopy?.(editorValue);
        }, [editorValue, handleCopy]);

        return (
            <div className="ms-code-editor-header">
                <div className="ms-code-editor-header__title">
                    {title === void 0 ? (
                        <EditorSelect
                            editorLang={editorLang}
                            onEditorLangChange={setEditorLang}
                            renderOptions={renderOptions}
                        />
                    ) : (
                        title
                    )}
                </div>
                <div className="ms-code-editor-header__operations">
                    {icon === void 0 ? (
                        <ContentCopyIcon className="ms-header-copy" onClick={handleCopyIcon} />
                    ) : (
                        icon
                    )}
                </div>
            </div>
        );
    },
);
