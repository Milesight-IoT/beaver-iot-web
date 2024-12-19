import { useCallback, useMemo } from 'react';
import { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { undo as undoCommand, redo as redoCommand } from '@codemirror/commands';
import type { EditorHandlers } from '../types';

interface IProps {
    editorInstanceRef: React.RefObject<ReactCodeMirrorRef>;
}
export const useEditorCommand = ({ editorInstanceRef }: IProps) => {
    /** Function to get the current EditorView instance */
    const getEditorView = useCallback(() => {
        return editorInstanceRef.current?.view;
    }, [editorInstanceRef]);

    /** Function to get the current EditorState instance */
    const getEditorState = useCallback(() => {
        return editorInstanceRef.current?.state;
    }, [editorInstanceRef]);

    /** Function to perform undo operation */
    const undo = useCallback(() => {
        const editorView = getEditorView();
        if (!editorView) return;

        undoCommand(editorView);
    }, [getEditorView]);

    /** Function to perform redo operation */
    const redo = useCallback(() => {
        const editorView = getEditorView();
        if (!editorView) return;

        redoCommand(editorView);
    }, [getEditorView]);

    /** Function to insert text at the current cursor position */
    const insert = useCallback(
        async (text: string) => {
            if (!text) return;
            const editorState = getEditorState();
            const editorView = getEditorView();
            if (!editorState || !editorView) return;

            // insert text at the current cursor position
            const { main } = editorView?.state?.selection || {};
            const { from, to } = main || {};
            const last = from + text.length;
            editorView.dispatch({
                changes: {
                    from,
                    to,
                    insert: text,
                },
                selection: {
                    anchor: last,
                    head: last,
                },
            });

            // Ensure the editor gains focus
            editorView.focus();
        },
        [getEditorState, getEditorView],
    );

    const handlers = useMemo<EditorHandlers>(() => {
        return {
            getEditorView,
            getEditorState,
            undo,
            redo,
            insert,
        };
    }, [getEditorState, getEditorView, insert, redo, undo]);

    return {
        handlers,
    };
};
