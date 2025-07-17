import React, { useCallback, useState } from 'react';
import { Box, IconButton, InputLabel, FormHelperText, CircularProgress } from '@mui/material';
import { type FieldError } from 'react-hook-form';
import classNames from 'classnames';
import { useCopy } from '@milesight/shared/src/hooks';
import {
    CloseFullscreenIcon,
    ContentCopyIcon,
    OpenInFullIcon,
} from '@milesight/shared/src/components';
import { CodeEditor as CodeMirror, type EditorProps, type EditorSupportLang } from '@/components';
import './style.less';

export interface IProps extends Omit<EditorProps, 'value' | 'onChange'> {
    title?: string;
    required?: boolean;
    error?: FieldError;
    rightSlot?: React.ReactNode;
    loading?: boolean;
    loadingSlot?: React.ReactNode;
    loadingText?: string;
    /**
     * Whether to enable read-only mode
     */
    readonly?: boolean;
    /**
     * Whether to enable the ability to copy the value
     */
    copyable?: boolean;
    /**
     *  Whether to expand
     */
    extendable?: boolean;
    /**
     * Whether to enable the ability to select upstream variables
     */
    variableSelectable?: boolean;
    /** Whether to automatically fill in the default value when language change. */
    autoFillDefaultValue?: boolean;
    defaultValues?: Partial<Record<EditorSupportLang, string>>;
    value: string;
    onChange: (value: string) => void;
}

const DEFAULT_LANGUAGE = 'yaml';
const SUPPORT_LANGUAGES: EditorSupportLang[] = ['yaml'];

/**
 * Code Editor Component
 *
 */
const CodeEditor: React.FC<IProps> = ({
    title,
    error,
    required = true,
    readOnly = false,
    copyable = true,
    extendable = true,
    rightSlot = null,
    loading = false,
    loadingSlot = null,
    loadingText = '',
    variableSelectable = false,
    autoFillDefaultValue,
    defaultValues,
    editorLang = DEFAULT_LANGUAGE,
    supportLangs = SUPPORT_LANGUAGES,
    value,
    onChange,
    ...props
}) => {
    const [codeFull, setCodeFull] = useState<boolean>(false);

    // ---------- Render Common Header ----------
    const { handleCopy } = useCopy();
    const renderHeader = useCallback<NonNullable<EditorProps['renderHeader']>>(
        ({ editorValue, editorLang, editorHandlers, setEditorLang }) => {
            return (
                <div className="ms-code-editor-header">
                    <div className="ms-code-editor-header-title">
                        <span>{editorLang?.toUpperCase()}</span>
                    </div>
                    <div className="ms-code-editor-header-actions">
                        <div className="ms-code-editor-header-action">
                            {copyable && (
                                <IconButton
                                    disabled={!editorValue}
                                    onClick={e => {
                                        e.stopPropagation();
                                        if (!editorValue) return;
                                        handleCopy(
                                            editorValue,
                                            e.currentTarget.closest('div') as HTMLElement,
                                        );
                                    }}
                                >
                                    <ContentCopyIcon />
                                </IconButton>
                            )}
                            {extendable && (
                                <IconButton
                                    onClick={() => {
                                        setCodeFull(!codeFull);
                                    }}
                                >
                                    {codeFull ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
                                </IconButton>
                            )}
                        </div>
                    </div>
                </div>
            );
        },
        [title, extendable, copyable, handleCopy, codeFull],
    );

    return (
        <div
            className={classNames('ms-code-editor-wrap', {
                'ms-code-editor-wrap-error': !!error,
                'ms-code-editor-wrap-full': codeFull,
            })}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {!!title && (
                    <InputLabel
                        id="select-label"
                        shrink={false}
                        required={required}
                        disabled={readOnly}
                    >
                        {title}
                    </InputLabel>
                )}
                {!!rightSlot && rightSlot}
            </Box>
            {loading ? (
                loadingSlot || (
                    <div className="ms-code-editor-wrap-loading">
                        <div>
                            <CircularProgress color="primary" size={20} />
                            {!!loadingText && <span>{loadingText}</span>}
                        </div>
                    </div>
                )
            ) : (
                <CodeMirror
                    {...props}
                    readOnly={readOnly}
                    editable={!readOnly}
                    editorLang={editorLang}
                    supportLangs={supportLangs}
                    renderHeader={renderHeader}
                    value={value}
                    onChange={onChange}
                />
            )}

            <div className={classNames('ms-code-editor-wrap-footer')}>
                {!!error && <FormHelperText error>{error?.message}</FormHelperText>}
            </div>
        </div>
    );
};

export default CodeEditor;
