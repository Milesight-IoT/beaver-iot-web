import {
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import { useMemoizedFn } from 'ahooks';
import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { Stage, Layer, Image as KonvaImage, Transformer, Line } from 'react-konva';
import { Tooltip } from '@mui/material';
import MarkerItem from './MarkerItem';
import {
    generateMarkerId,
    DEFAULT_MARKER_STYLE,
    percentToPixel,
    pixelToPercent,
    clampPosition,
    createMarker,
    calculateAlignmentGuidesWithSnap,
} from './utils';
import type {
    ImageMarkerProps,
    ImageMarkerInstance,
    Marker,
    MarkerPosition,
    ImageSize,
    MarkerChangeType,
    AlignmentGuide,
    DefaultMarkerStyle,
} from './types';

import './style.less';

/**
 * ImageMarker Component using Konva
 * High-performance image marker editor with Konva canvas rendering
 */
const ImageMarkerKonva = <T extends Record<string, any> = Record<string, any>>(
    {
        width = '100%',
        height = '100%',
        image,
        markers: propMarkers = [],
        defaultMarkerStyle = {},
        editable = true,
        deletable = true,
        keepAspectRatio = true,
        resizeStep = 1,
        showAlignmentGuides = true,
        alignmentThreshold = 5,
        alignmentLineColor = '#8e66ff',
        enablePopup = false,
        popupTrigger = 'hover',
        renderPopup,
        onMarkersChange,
        onMarkerClick,
        onMarkerDoubleClick,
        onImageLoaded,
        onImageError,
        renderMarker,
        className,
        style,
        minMarkerWidth = 16,
        minMarkerHeight = 16,
        idPrefix = 'marker',
    }: ImageMarkerProps<T>,
    ref?: React.ForwardedRef<ImageMarkerInstance<T>>,
) => {
    // ========== Stage ==========
    const stageRef = useRef<Konva.Stage>(null);
    const layerRef = useRef<Konva.Layer>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    // Handle stage click - add marker or clear selection
    const handleStageClick = useMemoizedFn((e: KonvaEventObject<MouseEvent>) => {
        const clickedOnEmpty = e.target === e.target.getStage() || e.target === imageRef.current;

        if (clickedOnEmpty) {
            if (editable && imageSize) {
                const stage = e.target.getStage();
                if (!stage) return;

                const pointerPos = stage.getPointerPosition();
                if (!pointerPos) return;

                // Convert to natural image coordinates
                const x = pointerPos.x / imageSize.scale;
                const y = pointerPos.y / imageSize.scale;

                const position = pixelToPercent(
                    x,
                    y,
                    imageSize.naturalWidth,
                    imageSize.naturalHeight,
                );
                handleAddMarker(position);
            } else {
                setSelectedIds(new Set());
            }
        }
    });

    // ========== Image ==========
    const imageRef = useRef<Konva.Image>(null);
    const [imageSize, setImageSize] = useState<ImageSize | null>(null);
    const [konvaImage, setKonvaImage] = useState<HTMLImageElement | null>(null);

    // Calculate image size based on container
    const calculateImageSize = useCallback(
        (img: HTMLImageElement) => {
            if (!containerRef.current) return;

            const container = containerRef.current;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            const imageAspectRatio = img.naturalWidth / img.naturalHeight;
            const containerAspectRatio = containerWidth / containerHeight;

            let displayWidth: number;
            let displayHeight: number;
            let scale: number;

            if (imageAspectRatio > containerAspectRatio) {
                // Image is wider than container
                displayWidth = containerWidth;
                displayHeight = containerWidth / imageAspectRatio;
                scale = displayWidth / img.naturalWidth;
            } else {
                // Image is taller than container
                displayHeight = containerHeight;
                displayWidth = containerHeight * imageAspectRatio;
                scale = displayHeight / img.naturalHeight;
            }

            const newImageSize: ImageSize = {
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
                width: displayWidth,
                height: displayHeight,
                scale,
            };

            setImageSize(newImageSize);
            setContainerSize({ width: displayWidth, height: displayHeight });
            onImageLoaded?.(newImageSize);
        },
        [onImageLoaded],
    );

    // Load image
    useEffect(() => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            setKonvaImage(img);
            calculateImageSize(img);
        };

        img.onerror = error => {
            onImageError?.(error as Event);
        };

        img.src = image;
    }, [image, onImageError, calculateImageSize]);

    // Handle window resize to recalculate image size
    useEffect(() => {
        if (!konvaImage) return;

        const handleResize = () => {
            calculateImageSize(konvaImage);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [konvaImage, calculateImageSize]);

    // ========== Marker ==========
    const [markers, setMarkers] = useState<Marker<T>[]>(propMarkers);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
    const [popupState, setPopupState] = useState<{
        markerId: string | null;
        position: { x: number; y: number; width: number; height: number } | null;
    }>({ markerId: null, position: null });

    // Merge default styles
    const mergedDefaultStyle: DefaultMarkerStyle = useMemo(
        () => ({ ...DEFAULT_MARKER_STYLE, ...defaultMarkerStyle }),
        [defaultMarkerStyle],
    );

    // Validate and clamp resize step
    const validResizeStep = useMemo(() => {
        return Math.max(0.1, Math.min(5, resizeStep));
    }, [resizeStep]);

    // Update markers when prop changes
    useEffect(() => {
        setMarkers(propMarkers);
    }, [propMarkers]);

    // Emit marker change event
    const emitMarkerChange = useCallback(
        (type: MarkerChangeType, marker: Marker<T>, newMarkers: Marker<T>[]) => {
            onMarkersChange?.({
                type,
                marker,
                markers: newMarkers,
            });
        },
        [onMarkersChange],
    );

    // Add marker
    const handleAddMarker = useCallback(
        (position: MarkerPosition) => {
            const newMarker = createMarker(position, mergedDefaultStyle, idPrefix) as Marker<T>;
            const newMarkers = [...markers, newMarker];
            setMarkers(newMarkers);
            emitMarkerChange('add', newMarker, newMarkers);
            return newMarker;
        },
        [markers, mergedDefaultStyle, idPrefix, emitMarkerChange],
    );

    // Update marker
    const handleUpdateMarker = useCallback(
        (id: string, updates: Partial<Omit<Marker<T>, 'id'>>) => {
            const newMarkers = markers.map(m => (m.id === id ? { ...m, ...updates } : m));
            const updatedMarker = newMarkers.find(m => m.id === id);
            if (updatedMarker) {
                setMarkers(newMarkers);
                emitMarkerChange('update', updatedMarker, newMarkers);
            }
        },
        [markers, emitMarkerChange],
    );

    // Delete marker
    const handleDeleteMarker = useCallback(
        (id: string) => {
            const markerToDelete = markers.find(m => m.id === id);
            if (!markerToDelete) return;

            const newMarkers = markers.filter(m => m.id !== id);
            setMarkers(newMarkers);
            setSelectedIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            emitMarkerChange('delete', markerToDelete, newMarkers);
        },
        [markers, emitMarkerChange],
    );

    // Delete selected markers
    const handleDeleteSelected = useCallback(() => {
        if (selectedIds.size === 0) return;

        selectedIds.forEach(id => {
            handleDeleteMarker(id);
        });
    }, [selectedIds, handleDeleteMarker]);

    // Handle marker selection
    const handleMarkerSelect = useMemoizedFn(
        (e: KonvaEventObject<MouseEvent>, markerId: string) => {
            e.cancelBubble = true;

            const marker = markers.find(m => m.id === markerId);
            if (!marker) return;

            // Handle click event with original KonvaEventObject and marker
            onMarkerClick?.(e, marker);

            if (!editable) return;

            // Handle selection
            if (e.evt.ctrlKey || e.evt.metaKey) {
                setSelectedIds(prev => {
                    const next = new Set(prev);
                    if (next.has(markerId)) {
                        next.delete(markerId);
                    } else {
                        next.add(markerId);
                    }
                    return next;
                });
            } else {
                setSelectedIds(new Set([markerId]));
            }
        },
    );

    // Handle marker double click
    const handleMarkerDoubleClick = useMemoizedFn(
        (e: KonvaEventObject<Event>, markerId: string) => {
            e.cancelBubble = true;
            const marker = markers.find(m => m.id === markerId);
            if (marker) {
                // Cast Event to MouseEvent for the callback
                onMarkerDoubleClick?.(e as KonvaEventObject<MouseEvent>, marker);
            }
        },
    );

    // Handle marker drag
    const handleMarkerDragMove = useMemoizedFn(
        (e: KonvaEventObject<DragEvent>, markerId: string) => {
            if (!imageSize || !editable) return;

            const node = e.target;
            const x = node.x() / imageSize.scale;
            const y = node.y() / imageSize.scale;

            const position = pixelToPercent(x, y, imageSize.naturalWidth, imageSize.naturalHeight);

            const marker = markers.find(m => m.id === markerId);
            if (!marker) return;

            // Calculate alignment guides with snap
            if (showAlignmentGuides && selectedIds.size <= 1) {
                const tempMarker = { ...marker, position };
                const { guides, snapX, snapY } = calculateAlignmentGuidesWithSnap(
                    tempMarker,
                    markers.filter(m => m.id !== markerId),
                    imageSize.naturalWidth,
                    imageSize.naturalHeight,
                    imageSize.scale,
                    alignmentThreshold,
                    mergedDefaultStyle,
                );

                setAlignmentGuides(guides);

                // Apply snap
                if (snapX !== undefined || snapY !== undefined) {
                    const snappedX = snapX !== undefined ? snapX : x * imageSize.scale;
                    const snappedY = snapY !== undefined ? snapY : y * imageSize.scale;

                    node.x(snappedX);
                    node.y(snappedY);

                    const snappedPosition = pixelToPercent(
                        snappedX / imageSize.scale,
                        snappedY / imageSize.scale,
                        imageSize.naturalWidth,
                        imageSize.naturalHeight,
                    );

                    handleUpdateMarker(markerId, { position: clampPosition(snappedPosition) });
                    return;
                }
            }

            handleUpdateMarker(markerId, { position: clampPosition(position) });
        },
    );

    const handleMarkerDragEnd = useMemoizedFn(() => {
        setAlignmentGuides([]);
    });

    // Keyboard events
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Handle escape - clear selection
            if (e.key === 'Escape' && selectedIds.size > 0) {
                e.preventDefault();
                setSelectedIds(new Set());
                return;
            }

            // Handle delete
            if (
                deletable &&
                selectedIds.size > 0 &&
                (e.key === 'Delete' || e.key === 'Backspace')
            ) {
                e.preventDefault();
                handleDeleteSelected();
                return;
            }

            // Handle arrow keys for position adjustment
            if (editable && selectedIds.size > 0 && imageSize) {
                const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
                if (!arrowKeys.includes(e.key)) return;

                e.preventDefault();

                // Calculate step size: 1px in original image coordinates
                // Use Shift key for larger steps (10px), Ctrl/Cmd for smaller steps (0.1px)
                let step = 1;
                if (e.shiftKey) {
                    step = 10;
                } else if (e.ctrlKey || e.metaKey) {
                    step = 0.1;
                }

                // Convert step to percentage
                const stepXPercent = (step / imageSize.naturalWidth) * 100;
                const stepYPercent = (step / imageSize.naturalHeight) * 100;

                // Calculate offset based on arrow key
                let offsetX = 0;
                let offsetY = 0;

                switch (e.key) {
                    case 'ArrowLeft':
                        offsetX = -stepXPercent;
                        break;
                    case 'ArrowRight':
                        offsetX = stepXPercent;
                        break;
                    case 'ArrowUp':
                        offsetY = -stepYPercent;
                        break;
                    case 'ArrowDown':
                        offsetY = stepYPercent;
                        break;
                    default:
                        break;
                }

                // Update all selected markers
                const newMarkers = markers.map(m => {
                    if (selectedIds.has(m.id)) {
                        const newPosition = {
                            x: m.position.x + offsetX,
                            y: m.position.y + offsetY,
                        };
                        return { ...m, position: clampPosition(newPosition) };
                    }
                    return m;
                });

                setMarkers(newMarkers);

                // Emit change events for each updated marker
                selectedIds.forEach(id => {
                    const updatedMarker = newMarkers.find(m => m.id === id);
                    if (updatedMarker) {
                        onMarkersChange?.({
                            type: 'update',
                            marker: updatedMarker,
                            markers: newMarkers,
                        });
                    }
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        deletable,
        editable,
        selectedIds,
        markers,
        imageSize,
        handleDeleteSelected,
        onMarkersChange,
    ]);

    // ========== Transformer ==========
    const transformerRef = useRef<Konva.Transformer>(null);

    // Handle transform (resize) with alignment guides
    const handleTransform = useMemoizedFn(() => {
        if (!imageSize || !editable || !layerRef.current || !transformerRef.current) return;
        if (!showAlignmentGuides || selectedIds.size !== 1) {
            setAlignmentGuides([]);
            return;
        }

        const selectedId = Array.from(selectedIds)[0];
        const node = layerRef.current.findOne(`#marker-${selectedId}`) as Konva.Group | undefined;
        if (!node) return;

        const marker = markers.find(m => m.id === selectedId);
        if (!marker) return;

        const transformer = transformerRef.current;
        const activeAnchor = transformer.getActiveAnchor();
        if (!activeAnchor) return;

        // Get current bounds
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const markerWidth = (marker.style?.width ?? mergedDefaultStyle.width) * scaleX;
        const markerHeight = (marker.style?.height ?? mergedDefaultStyle.height) * scaleY;

        const x = node.x() / imageSize.scale;
        const y = node.y() / imageSize.scale;

        // Calculate edges based on anchor position
        const left = x - markerWidth / 2;
        const right = x + markerWidth / 2;
        const top = y - markerHeight / 2;
        const bottom = y + markerHeight / 2;

        const guides: AlignmentGuide[] = [];
        const otherMarkers = markers.filter(m => m.id !== selectedId);

        // Determine which edges to check based on active anchor
        let checkLeft = false;
        let checkRight = false;
        let checkTop = false;
        let checkBottom = false;

        switch (activeAnchor) {
            case 'top-left':
                checkLeft = true;
                checkTop = true;
                break;
            case 'top-right':
                checkRight = true;
                checkTop = true;
                break;
            case 'bottom-left':
                checkLeft = true;
                checkBottom = true;
                break;
            case 'bottom-right':
                checkRight = true;
                checkBottom = true;
                break;
            default:
                break;
        }

        const threshold = alignmentThreshold / imageSize.scale;

        // Check alignment with other markers
        otherMarkers.forEach(other => {
            const otherWidth = other.style?.width ?? mergedDefaultStyle.width;
            const otherHeight = other.style?.height ?? mergedDefaultStyle.height;

            const { x: otherX, y: otherY } = percentToPixel(
                other.position,
                imageSize.naturalWidth,
                imageSize.naturalHeight,
            );

            const otherLeft = otherX - otherWidth / 2;
            const otherRight = otherX + otherWidth / 2;
            const otherTop = otherY - otherHeight / 2;
            const otherBottom = otherY + otherHeight / 2;

            // Check vertical edges
            if (checkLeft && Math.abs(left - otherLeft) < threshold) {
                guides.push({
                    type: 'vertical',
                    position: otherLeft * imageSize.scale,
                });
            }
            if (checkLeft && Math.abs(left - otherRight) < threshold) {
                guides.push({
                    type: 'vertical',
                    position: otherRight * imageSize.scale,
                });
            }
            if (checkRight && Math.abs(right - otherLeft) < threshold) {
                guides.push({
                    type: 'vertical',
                    position: otherLeft * imageSize.scale,
                });
            }
            if (checkRight && Math.abs(right - otherRight) < threshold) {
                guides.push({
                    type: 'vertical',
                    position: otherRight * imageSize.scale,
                });
            }

            // Check horizontal edges
            if (checkTop && Math.abs(top - otherTop) < threshold) {
                guides.push({
                    type: 'horizontal',
                    position: otherTop * imageSize.scale,
                });
            }
            if (checkTop && Math.abs(top - otherBottom) < threshold) {
                guides.push({
                    type: 'horizontal',
                    position: otherBottom * imageSize.scale,
                });
            }
            if (checkBottom && Math.abs(bottom - otherTop) < threshold) {
                guides.push({
                    type: 'horizontal',
                    position: otherTop * imageSize.scale,
                });
            }
            if (checkBottom && Math.abs(bottom - otherBottom) < threshold) {
                guides.push({
                    type: 'horizontal',
                    position: otherBottom * imageSize.scale,
                });
            }
        });

        setAlignmentGuides(guides);
    });

    // Handle transform end for all selected markers (triggered by Transformer)
    const handleTransformEnd = useMemoizedFn(() => {
        if (!imageSize || !editable || !layerRef.current) return;

        // Clear alignment guides
        setAlignmentGuides([]);

        const updates: Array<{ id: string; updates: Partial<Omit<Marker, 'id'>> }> = [];

        // Process all selected markers
        selectedIds.forEach(id => {
            const node = layerRef.current?.findOne(`#marker-${id}`) as Konva.Group | undefined;
            if (!node) return;

            const marker = markers.find(m => m.id === id);
            if (!marker) return;

            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            const markerWidth = marker.style?.width ?? mergedDefaultStyle.width;
            const markerHeight = marker.style?.height ?? mergedDefaultStyle.height;

            // Calculate new dimensions
            let newWidth = markerWidth * scaleX;
            let newHeight = markerHeight * scaleY;

            // Apply resize step - round to nearest step
            newWidth = Math.round(newWidth / validResizeStep) * validResizeStep;
            newHeight = Math.round(newHeight / validResizeStep) * validResizeStep;

            // Apply minimum constraints
            newWidth = Math.max(minMarkerWidth, newWidth);
            newHeight = Math.max(minMarkerHeight, newHeight);

            // Reset scale to 1
            node.scaleX(1);
            node.scaleY(1);

            // Update position (center)
            const x = node.x() / imageSize.scale;
            const y = node.y() / imageSize.scale;
            const position = pixelToPercent(x, y, imageSize.naturalWidth, imageSize.naturalHeight);

            updates.push({
                id,
                updates: {
                    style: { ...marker.style, width: newWidth, height: newHeight },
                    position: clampPosition(position),
                },
            });
        });

        // Batch update all markers at once
        if (updates.length > 0) {
            const newMarkers = markers.map(m => {
                const update = updates.find(u => u.id === m.id);
                if (update) {
                    return { ...m, ...update.updates } as Marker<T>;
                }
                return m;
            });
            setMarkers(newMarkers);

            // Emit change events for each updated marker
            updates.forEach(update => {
                const updatedMarker = newMarkers.find(m => m.id === update.id);
                if (updatedMarker) {
                    onMarkersChange?.({
                        type: 'update',
                        marker: updatedMarker as Marker<T>,
                        markers: newMarkers as Marker<T>[],
                    });
                }
            });
        }
    });

    // Update transformer
    useEffect(() => {
        if (!transformerRef.current || !layerRef.current) return;

        const transformer = transformerRef.current;
        const selectedNodes: Konva.Node[] = [];

        selectedIds.forEach(id => {
            const node = layerRef.current?.findOne(`#marker-${id}`);
            if (node) {
                selectedNodes.push(node);
            }
        });

        transformer.nodes(selectedNodes);
        transformer.getLayer()?.batchDraw();
    }, [selectedIds, markers]);

    // ========== Expose instance methods ==========
    useImperativeHandle(ref, () => ({
        addMarker: (marker: Omit<Marker<T>, 'id'> & { id?: string }): Marker<T> => {
            const id = marker.id || generateMarkerId(idPrefix);
            const newMarker = { ...marker, id } as Marker<T>;
            const newMarkers = [...markers, newMarker];
            setMarkers(newMarkers);
            emitMarkerChange('add', newMarker, newMarkers);
            return newMarker;
        },
        updateMarker: (id: string, updates: Partial<Omit<Marker<T>, 'id'>>) => {
            handleUpdateMarker(id, updates);
        },
        deleteMarker: handleDeleteMarker,
        getMarkers: (): Marker<T>[] => markers,
        getMarkerById: (id: string): Marker<T> | undefined => markers.find(m => m.id === id),
        clearSelection: () => setSelectedIds(new Set()),
        selectMarkers: ids => setSelectedIds(new Set(ids)),
        getSelectedIds: () => Array.from(selectedIds),
        getImageSize: () => imageSize,
    }));

    if (!konvaImage || !imageSize) {
        return (
            <div
                ref={containerRef}
                className={`ms-image-marker ${className || ''}`}
                style={{ width, height, ...style }}
            />
        );
    }

    return (
        <div
            ref={containerRef}
            className={`ms-image-marker ${className || ''}`}
            style={{ width: containerSize.width, height: containerSize.height, ...style }}
        >
            <Stage
                ref={stageRef}
                width={containerSize.width}
                height={containerSize.height}
                onClick={handleStageClick}
                onTap={handleStageClick}
            >
                <Layer ref={layerRef}>
                    {/* Background Image */}
                    <KonvaImage
                        ref={imageRef}
                        image={konvaImage}
                        width={imageSize.width}
                        height={imageSize.height}
                    />

                    {/* Alignment Guides */}
                    {showAlignmentGuides &&
                        alignmentGuides.map((guide, index) => (
                            <Line
                                // eslint-disable-next-line react/no-array-index-key
                                key={index}
                                points={
                                    guide.type === 'vertical'
                                        ? [guide.position, 0, guide.position, imageSize.height]
                                        : [0, guide.position, imageSize.width, guide.position]
                                }
                                stroke={alignmentLineColor}
                                strokeWidth={1}
                                dash={[4, 4]}
                                listening={false}
                            />
                        ))}

                    {/* Markers */}
                    {markers.map(marker => {
                        const markerWidth = marker.style?.width ?? mergedDefaultStyle.width;
                        const markerHeight = marker.style?.height ?? mergedDefaultStyle.height;
                        const borderRadius =
                            marker.style?.borderRadius ?? mergedDefaultStyle.borderRadius;
                        const { x, y } = percentToPixel(
                            marker.position,
                            imageSize.naturalWidth,
                            imageSize.naturalHeight,
                        );

                        return (
                            <MarkerItem
                                key={marker.id}
                                marker={marker}
                                isSelected={selectedIds.has(marker.id)}
                                x={x * imageSize.scale}
                                y={y * imageSize.scale}
                                width={markerWidth * imageSize.scale}
                                height={markerHeight * imageSize.scale}
                                fill={
                                    marker.style?.backgroundColor ??
                                    mergedDefaultStyle.backgroundColor
                                }
                                cornerRadius={typeof borderRadius === 'number' ? borderRadius : 0}
                                border={marker.style?.border}
                                boxShadow={marker.style?.boxShadow}
                                editable={editable}
                                renderMarker={renderMarker as any}
                                onClick={e => {
                                    handleMarkerSelect(e, marker.id);
                                    // Handle click trigger for popup
                                    if (editable || !enablePopup || popupTrigger !== 'click') {
                                        return;
                                    }
                                    if (popupState.markerId === marker.id) {
                                        setPopupState({ markerId: null, position: null });
                                    } else {
                                        setPopupState({
                                            markerId: marker.id,
                                            position: {
                                                x: x * imageSize.scale,
                                                y: y * imageSize.scale,
                                                width: markerWidth * imageSize.scale,
                                                height: markerHeight * imageSize.scale,
                                            },
                                        });
                                    }
                                }}
                                onMouseEnter={() => {
                                    // Handle hover trigger for popup
                                    if (editable || !enablePopup || popupTrigger !== 'hover') {
                                        return;
                                    }
                                    setPopupState({
                                        markerId: marker.id,
                                        position: {
                                            x: x * imageSize.scale,
                                            y: y * imageSize.scale,
                                            width: markerWidth * imageSize.scale,
                                            height: markerHeight * imageSize.scale,
                                        },
                                    });
                                }}
                                onMouseLeave={() => {
                                    // Clear popup on mouse leave for all trigger
                                    if (editable || !enablePopup) return;
                                    setPopupState({ markerId: null, position: null });
                                }}
                                onTap={e => {
                                    e.cancelBubble = true;
                                    const m = markers.find(mk => mk.id === marker.id);

                                    if (!m) return;
                                    // onTap uses Event type, cast to MouseEvent for callback
                                    onMarkerClick?.(e as any, m);
                                    if (editable) {
                                        setSelectedIds(new Set([marker.id]));
                                    }
                                }}
                                onDblClick={e => handleMarkerDoubleClick(e, marker.id)}
                                onDblTap={e => handleMarkerDoubleClick(e, marker.id)}
                                onDragMove={e => handleMarkerDragMove(e, marker.id)}
                                onDragEnd={handleMarkerDragEnd}
                            />
                        );
                    })}

                    {/* Transformer for selected markers */}
                    {editable && (
                        <Transformer
                            ignoreStroke
                            ref={transformerRef}
                            // borderEnabled={false}
                            anchorSize={6}
                            borderStrokeWidth={1}
                            borderStroke="#8e66ff"
                            anchorStroke="#8e66ff"
                            rotateEnabled={false}
                            enabledAnchors={[
                                'top-left',
                                'top-right',
                                'bottom-left',
                                'bottom-right',
                            ]}
                            keepRatio={keepAspectRatio}
                            boundBoxFunc={(oldBox, newBox) => {
                                // Apply minimum size constraints
                                const minWidth = minMarkerWidth * imageSize.scale;
                                const minHeight = minMarkerHeight * imageSize.scale;

                                if (newBox.width < minWidth || newBox.height < minHeight) {
                                    return oldBox;
                                }
                                return newBox;
                            }}
                            onTransform={handleTransform}
                            onTransformEnd={handleTransformEnd}
                        />
                    )}
                </Layer>
            </Stage>

            {/* Popup using MUI Tooltip - rendered in DOM layer */}
            {enablePopup &&
                !editable &&
                popupState.markerId &&
                popupState.position &&
                (() => {
                    const currentMarker = markers.find(m => m.id === popupState.markerId);
                    if (!currentMarker) return null;

                    const pos = popupState.position;

                    // Calculate position relative to container
                    const left = pos.x - pos.width / 2;
                    const top = pos.y - pos.height / 2;

                    // Tooltip content
                    const tooltipContent = renderPopup
                        ? renderPopup(currentMarker)
                        : currentMarker.content;

                    return (
                        <Tooltip
                            open
                            arrow
                            placement="top"
                            slotProps={{
                                popper: {
                                    className: 'ms-image-marker-popup',
                                },
                            }}
                            title={tooltipContent || ''}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    left: `${left}px`,
                                    top: `${top}px`,
                                    width: `${pos.width}px`,
                                    height: `${pos.height}px`,
                                    pointerEvents: 'none',
                                }}
                            />
                        </Tooltip>
                    );
                })()}
        </div>
    );
};

// Use forwardRef wrapper to preserve generic type
const ForwardImageMarker = forwardRef(ImageMarkerKonva) as <T = unknown>(
    props: ImageMarkerProps<T> & { ref?: React.ForwardedRef<ImageMarkerInstance<T>> },
) => React.ReactElement;

// Set display name on the original component
ImageMarkerKonva.displayName = 'ImageMarker';

export default ForwardImageMarker;
