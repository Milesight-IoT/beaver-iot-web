import React from 'react';
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
        style,
        renderOptions,
        supportLangs,
    }: EditorToolbarProps) => {
        const { handleCopy } = useCopy();

        return (
            <div className="ms-code-editor-header" style={style}>
                <div className="ms-code-editor-header__title">
                    {title === void 0 ? (
                        <EditorSelect
                            editorLang={editorLang}
                            onEditorLangChange={setEditorLang}
                            renderOptions={renderOptions}
                            supportLangs={supportLangs}
                        />
                    ) : (
                        title
                    )}
                </div>
                <div className="ms-code-editor-header__operations">
                    {icon === void 0 ? (
                        <ContentCopyIcon
                            className="ms-header-copy"
                            onClick={e =>
                                handleCopy(
                                    editorValue,
                                    (e.target as HTMLElement).parentElement || undefined,
                                )
                            }
                        />
                    ) : (
                        icon
                    )}
                </div>
            </div>
        );
    },
);
