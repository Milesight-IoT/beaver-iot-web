import React, { memo } from 'react';
import { useDrop } from 'react-dnd';
import { DndItemType } from './constants';

export interface DragContainerProps {
    /** The callback function when dragging and releasing receives the data of the dragged item */
    onDrop?: (item: any) => void;
    className?: string;
    children?: React.ReactNode;
}

/**
 * Draggable container components for wrapping the placement area
 * The DragCard component is wrapped with DragContainer to implement the relevant drag function
 */
const DragContainer: React.FC<DragContainerProps> = memo(({ onDrop, className, children }) => {
    const [_, drop] = useDrop({
        // Specify the type of accepted drag-and-drop item (which must be consistent with the type of the card accept)
        accept: DndItemType.CARD,

        // The processing function when dragging and releasing
        drop: item => {
            // Pass the drag-and-drop item data
            onDrop && onDrop(item);
        },

        // Collect the drag-and-drop state function to obtain the drag-and-drop state during rendering
        collect: monitor => ({
            // Whether it is being dragged past the current container
            isOver: monitor.isOver(),
            // Can the current container hold drag-and-drop items
            canDrop: monitor.canDrop(),
        }),
    });

    return (
        <div ref={drop} className={className}>
            {children}
        </div>
    );
});

export default DragContainer;
