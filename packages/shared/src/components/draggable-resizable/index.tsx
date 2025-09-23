import React, { useMemo, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import type { DraggerType } from './typings';
import './style.less';

interface DraggableResizableBoxProps {
    // id: string;
    left?: number;
    top?: number;
    id: ApiKey;
    className?: string;
    width?: number;
    height?: number;
    limitMinWidth?: number;
    limitMinHeight?: number;
    limitMaxWidth?: number;
    limitMaxHeight?: number;
    isEdit: boolean;
    children: React.ReactNode;
    onResize: (data: DraggerType) => void;
    onMove: ({ id, left, top }: { id: ApiKey; left: number; top: number }) => void;
    /**
     * Drag and drop opposite elements
     */
    parentRef: any;
    onStartMove: (id: ApiKey) => void;
    onEndMove: ({ id, left, top }: { id: ApiKey; left: number; top: number }) => void;
    isOverLimit: (data: DraggerType) => boolean;
}

const DraggableResizableBox = ({
    left,
    top,
    id,
    className,
    width,
    height,
    limitMinWidth,
    limitMinHeight,
    limitMaxWidth,
    limitMaxHeight,
    isEdit,
    children,
    onResize,
    onMove,
    parentRef,
    onStartMove,
    onEndMove,
    isOverLimit,
}: DraggableResizableBoxProps) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'BOX',
        item: { id },
        collect: (monitor: any) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    const ref = useRef<any>(null);
    const offsetRef = useRef({ x: 0, y: 0 });
    const currentSize = useRef({ width, height });
    const [key, setKey] = useState('');

    const [, drop] = useDrop({
        accept: 'BOX',
    });

    const style: React.CSSProperties = useMemo(() => {
        if (left !== undefined && top !== undefined) {
            return {
                position: 'absolute',
                left,
                top,
            };
        }
        return {
            position: 'absolute',
        };
    }, [left, top]);

    drag(drop(ref));
    return (
        <ResizableBox
            key={`${id}-${key}`}
            width={width || 10}
            height={height || 10}
            minConstraints={[limitMinWidth || 50, limitMinHeight || 50]}
            maxConstraints={[limitMaxWidth || 600, limitMaxHeight || 300]}
            onResizeStop={(e: any, data: any) => {
                // Process the resized logic
                onResize({ ...data.size, id });
                currentSize.current = { ...data.size };
            }}
            onResize={(e: any, data: any) => {
                // Beyond that, drag-and-drop size is no longer allowed
                if (isOverLimit({ ...data.size, id })) {
                    onResize({ ...currentSize.current, id });
                    // Update the key once to force a re-rendering
                    setKey(`${data.size.width}-${data.size.height}`);
                    return;
                }
                // Stores the current resizing value
                currentSize.current = { ...data.size };
            }}
            resizeHandles={isEdit ? ['se'] : []} // Dynamic setting whether to resize
            handle={<span className="drag-resizable-handle" />}
            style={{ ...style }}
        >
            <div
                ref={isEdit ? ref : undefined}
                className={className}
                draggable={isEdit}
                onDragStart={(e: any) => {
                    e.stopPropagation();
                    const img = new Image();
                    img.src = '';
                    e.dataTransfer.setDragImage(img, 0, 0);
                    const offset = ref.current?.getBoundingClientRect?.();
                    offsetRef.current = {
                        x: e.pageX - offset.left,
                        y: e.pageY - offset.top,
                    };
                    onStartMove(id);
                }}
                onDrag={(e: any) => {
                    e.preventDefault();
                    const parentOffset = parentRef.current?.getBoundingClientRect?.();
                    let left = e.pageX - parentOffset.left - offsetRef.current.x;
                    let top = e.pageY - parentOffset.top - offsetRef.current.y;
                    if (!isEdit) {
                        return;
                    }
                    if (e.pageX === 0 && e.pageY === 0) {
                        return;
                    }
                    if (left < 0) {
                        left = 0;
                    }
                    if (top < 0) {
                        top = 0;
                    }
                    if (left > parentRef.current.clientWidth - ref.current.clientWidth) {
                        left = parentRef.current.clientWidth - ref.current.clientWidth;
                    }
                    if (top > parentRef.current.clientHeight - ref.current.clientHeight) {
                        top = parentRef.current.clientHeight - ref.current.clientHeight;
                    }
                    onMove({
                        id,
                        left,
                        top,
                    });
                }}
                onDragEnd={(e: any) => {
                    e.preventDefault();
                    const parentOffset = parentRef.current?.getBoundingClientRect?.();
                    let left = e.pageX - parentOffset.left - offsetRef.current.x;
                    let top = e.pageY - parentOffset.top - offsetRef.current.y;
                    if (!isEdit) {
                        return;
                    }
                    if (e.pageX === 0 && e.pageY === 0) {
                        return;
                    }
                    if (left < 0) {
                        left = 0;
                    }
                    if (top < 0) {
                        top = 0;
                    }
                    if (left > parentRef.current.clientWidth - ref.current.clientWidth) {
                        left = parentRef.current.clientWidth - ref.current.clientWidth;
                    }
                    if (top > parentRef.current.clientHeight - ref.current.clientHeight) {
                        top = parentRef.current.clientHeight - ref.current.clientHeight;
                    }
                    onEndMove({
                        id,
                        left,
                        top,
                    });
                }}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    // opacity: isDragging ? 0.5 : 1,
                    zIndex: isDragging ? 10 : 1,
                    cursor: isEdit ? 'move' : 'auto',
                    left: 0,
                    top: 0,
                }}
            >
                {children}
            </div>
        </ResizableBox>
    );
};

export default DraggableResizableBox;
