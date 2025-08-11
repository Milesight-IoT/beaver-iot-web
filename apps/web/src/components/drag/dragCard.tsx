import React, { useRef, memo } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { DndItemType } from './constants';

export interface DragCardProps {
    /**
     * Child elements to render inside the card
     */
    children: React.ReactNode;
    /**
     *  Unique identifier for the card
     */
    id?: any;
    /**
     * Position index of the card in the list
     */
    index: number;
    /**
     * Index of the parent list
     */
    parentIndex?: number;
    canDrag?: boolean;
    /**
     * Callback when dragging start
     */
    moveCard: (
        /**
         * Original index of the dragged card
         */
        dragIndex: number,
        /**
         *  Original parent index of the dragged card
         */
        dragParentIndex: number,
        /**
         * Target index where the card is dropped
         */
        hoverIndex: number,
        /**
         * Target parent index
         */
        hoverParentIndex: number,
    ) => void;
    /**
     * Callback when dragging ends
     */
    onDragEnd?: (item: any) => void;
}

interface DragItem {
    index: number;
    id?: string;
    parentIndex: number;
}

/**
 * The incoming component will be wrapped into a draggable component
 */
const DragCard: React.FC<DragCardProps> = memo(
    ({ id, index, moveCard, children, parentIndex = 0, onDragEnd, canDrag = true }) => {
        const ref = useRef<HTMLDivElement>(null);
        const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: any }>({
            accept: DndItemType.CARD,
            collect(monitor) {
                return {
                    handlerId: monitor.getHandlerId(),
                };
            },
            hover(_: DragItem, monitor) {
                if (!ref.current) {
                    return;
                }

                const dragParentIndex = monitor.getItem().parentIndex;
                const hoverParentIndex = parentIndex;
                const dragIndex = monitor.getItem().index;
                const hoverIndex = index;
                // Don't replace items with themselves
                if (dragParentIndex === hoverParentIndex && dragIndex === hoverIndex) {
                    return;
                }
                // Determine rectangle on screen
                const hoverBoundingRect = ref.current?.getBoundingClientRect();

                // Get vertical middle
                const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

                // Determine mouse position
                const clientOffset = monitor.getClientOffset();

                // Get pixels to the top
                const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top;

                // Only perform the move when the mouse has crossed half of the items height
                // When dragging downwards, only move when the cursor is below 50%
                // When dragging upwards, only move when the cursor is above 50%

                // Dragging downwards
                if (
                    dragParentIndex <= hoverParentIndex &&
                    dragIndex < hoverIndex &&
                    hoverClientY < hoverMiddleY
                ) {
                    return;
                }
                // Dragging upwards
                if (
                    dragParentIndex >= hoverParentIndex &&
                    dragIndex > hoverIndex &&
                    hoverClientY > hoverMiddleY
                ) {
                    return;
                }
                // Time to actually perform the action
                moveCard(dragIndex, dragParentIndex, hoverIndex, hoverParentIndex);

                // Note: we're mutating the monitor item here!
                // Generally it's better to avoid mutations,
                // but it's good here for the sake of performance
                // to avoid expensive index searches.
                monitor.getItem().index = hoverIndex;
                monitor.getItem().parentIndex = hoverParentIndex;
            },
        });

        const [{ isDragging }, drag] = useDrag({
            type: DndItemType.CARD,
            item: () => {
                return { id, index, parentIndex };
            },
            collect: (monitor: any) => ({
                isDragging: monitor.isDragging(),
            }),
            end: item => {
                onDragEnd && onDragEnd(item);
            },
            canDrag,
        });
        const opacity = isDragging ? 0 : 1;
        const style = {
            cursor: canDrag ? 'move' : 'default',
        };

        drag(drop(ref));
        return (
            <div ref={ref} style={{ ...style, opacity }} data-handler-id={handlerId}>
                {children}
            </div>
        );
    },
);

export default DragCard;
