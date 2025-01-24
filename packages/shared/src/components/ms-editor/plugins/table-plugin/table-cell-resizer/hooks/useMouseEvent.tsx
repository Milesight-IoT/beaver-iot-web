import { useEffect, useRef } from 'react';
import { $getNearestNodeFromDOMNode } from 'lexical';
import {
    $getTableNodeFromLexicalNodeOrThrow,
    getDOMCellFromTarget,
    type TableDOMCell,
} from '@lexical/table';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useMemoizedFn } from 'ahooks';
import { delay } from '../../../../../../utils/tools';
import { isMouseDownOnEvent } from '../helper';
import type { MouseDraggingDirection, MousePosition } from '../type';

interface IProps {
    resetState: () => void;
    updateMouseCurrentPos: React.Dispatch<React.SetStateAction<MousePosition | null>>;
    updateIsMouseDown: React.Dispatch<React.SetStateAction<boolean>>;
    draggingDirection: MouseDraggingDirection | null;
    tableRectRef: React.MutableRefObject<DOMRect | null>;
    activeCell: TableDOMCell | null;
    updateActiveCell: React.Dispatch<React.SetStateAction<TableDOMCell | null>>;
}
export const useMouseEvent = ({
    resetState,
    updateMouseCurrentPos,
    updateIsMouseDown,
    draggingDirection,
    tableRectRef,
    activeCell,
    updateActiveCell,
}: IProps) => {
    const [editor] = useLexicalComposerContext();

    const targetRef = useRef<HTMLElement | null>(null);
    const resizerRef = useRef<HTMLDivElement | null>(null);

    /** Setting up active form items */
    const setupActiveCell = useMemoizedFn((cell: TableDOMCell, target: HTMLElement) => {
        editor.update(() => {
            // Gets the nearest table cell node, tableCellNode.
            const tableCellNode = $getNearestNodeFromDOMNode(cell.elem);
            if (!tableCellNode) {
                throw new Error('TableCellResizer: Table cell node not found.');
            }

            // Get the most recent table cell node tableCellNode.
            const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
            // Get the table element tableElement by the key of the table node.
            const tableElement = editor.getElementByKey(tableNode.getKey());

            if (!tableElement) {
                throw new Error('TableCellResizer: Table element not found.');
            }

            // and set a new active cell activeCell
            targetRef.current = target;
            tableRectRef.current = tableElement.getBoundingClientRect();
            updateActiveCell(cell);
        });
    });
    /** Update mouse coordinates */
    const setupMousePos = useMemoizedFn((x: number, y: number) => {
        updateMouseCurrentPos({ x, y });
    });

    useEffect(() => {
        const onMouseMove = async (event: MouseEvent) => {
            await delay(0);

            // Update position while dragging
            if (draggingDirection) {
                setupMousePos(event.clientX, event.clientY);
                return;
            }

            const { target } = event;

            // Updates the `isMouseDown` state to determine if the mouse is pressed.
            updateIsMouseDown(isMouseDownOnEvent(event));
            if (resizerRef.current && resizerRef.current.contains(target as Node)) return;
            if (targetRef.current === target) return;

            // Get the table cell corresponding to the target element cell
            targetRef.current = target as HTMLElement;
            const cell = getDOMCellFromTarget(target as HTMLElement);

            // If the cell exists and is different from the currently active cell activeCell, use editor.update to update the editor state:
            if (cell && activeCell !== cell) {
                setupActiveCell(cell, target as HTMLElement);
            } else if (cell == null) {
                // If cell is empty, call resetState to reset the state.
                resetState();
            }
        };

        // Record mouse press status
        const onMouseDown = async () => {
            await delay(0);
            updateIsMouseDown(true);
        };
        // Record mouse up status
        const onMouseUp = async () => {
            await delay(0);
            updateIsMouseDown(false);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mouseup', onMouseUp);

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, [activeCell, draggingDirection, editor, resetState]);
};
