import { useCallback, useEffect } from 'react';
import { $getSelection, $isRangeSelection } from 'lexical';
import { $getTableCellNodeFromLexicalNode, type TableCellNode } from '@lexical/table';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

interface IProps {
    menuRootRef: React.MutableRefObject<HTMLElement | null>;
    setTableMenuCellNode: React.Dispatch<React.SetStateAction<TableCellNode | null>>;
}
export const useTableCell = ({ menuRootRef, setTableMenuCellNode }: IProps) => {
    const [editor] = useLexicalComposerContext();

    /** Gets the selected table */
    const $moveMenu = useCallback(() => {
        const menu = menuRootRef.current;
        const selection = $getSelection();
        const nativeSelection = window.getSelection();
        const { activeElement } = document;

        if (selection == null || menu == null) {
            setTableMenuCellNode(null);
            return;
        }

        const rootElement = editor.getRootElement();
        if (
            $isRangeSelection(selection) &&
            rootElement !== null &&
            nativeSelection !== null &&
            rootElement.contains(nativeSelection.anchorNode)
        ) {
            // Get the selected form
            const tableCellNodeFromSelection = $getTableCellNodeFromLexicalNode(
                selection.anchor.getNode(),
            );

            if (tableCellNodeFromSelection == null) {
                setTableMenuCellNode(null);
                return;
            }

            // Get the DOM node of the table
            const tableCellParentNodeDOM = editor.getElementByKey(
                tableCellNodeFromSelection.getKey(),
            );

            if (tableCellParentNodeDOM == null) {
                setTableMenuCellNode(null);
                return;
            }

            // Save Table The selected table is used for menu positioning
            setTableMenuCellNode(tableCellNodeFromSelection);
        } else if (!activeElement) {
            setTableMenuCellNode(null);
        }
    }, [editor]);

    useEffect(() => {
        return editor.registerUpdateListener(() => {
            editor.getEditorState().read(() => {
                $moveMenu();
            });
        });
    });
};
