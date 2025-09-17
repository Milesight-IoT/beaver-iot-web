import React, { useState, useEffect, useMemo, useCallback, forwardRef } from 'react';
import { useMemoizedFn } from 'ahooks';
import { isNil, cloneDeep, flatten, uniqWith, isEqual } from 'lodash-es';
import { Stage, Layer, Image, Line, Circle, Group, Transformer } from 'react-konva';
import { yellow, white, black } from '@milesight/shared/src/services/theme';
import type { Vector2d } from 'konva/lib/types';
import type { ShapeConfig } from 'konva/lib/Shape';
import type { Stage as StageInstance } from 'konva/lib/Stage';
import EditableText from './editable-text';
import {
    defaultRectConfig,
    defaultPolygonConfig,
    defaultSkeletonAnchorConfig,
    defaultSkeletonLineConfig,
} from './config';
import './style.less';

type ShapeType = 'rect' | 'polygon' | 'line' | 'circle' | 'text';

/**
 * Points data type
 */
export type PointType = {
    /**
     * Label
     */
    label?: string;
    /**
     * Confidence Level
     */
    confidence?: number;
    /**
     * Points value
     * @deprecated
     */
    value?: Vector2d[];
    /**
     * Rectangle
     *
     * Attention: Currently only rectangles are editable
     */
    rect?: Vector2d[];
    /**
     * Polygon
     */
    polygon?: Vector2d[];
    /**
     * Skeleton
     */
    skeleton?: Vector2d[][];
};

type ImageSize = {
    naturalWidth: number;
    naturalHeight: number;
    width: number;
    height: number;
};

export interface ImageAnnotationProps {
    /** Image source */
    imgSrc: string;
    /** Polygon points */
    points: PointType[];
    /** Stroke color */
    strokeColor?: string | string[];
    /** Anchor fill color */
    anchorFillColor?: string;
    /** Container width */
    containerWidth?: number;
    /** Container height */
    containerHeight?: number;

    /**
     * Rectangle config
     */
    rectConfig?: Partial<ShapeConfig>;
    /**
     * Polygon config
     */
    polygonConfig?: Partial<ShapeConfig>;
    /**
     * Skeleton config
     */
    skeletonConfig?: {
        line?: Partial<ShapeConfig>;
        circle?: Partial<ShapeConfig>;
    };

    /** Image loaded callback */
    onImageLoaded?: (imgSize: ImageSize) => void;

    /** Load image error callback */
    onImageError?: OnErrorEventHandler;

    /** Points change callback */
    onPointsChange?: (newPoints: PointType[]) => void;
}

export type ImageAnnotationInstance = StageInstance;

const SHAPE_NAME_PREFIX = 'ms-shape';
const getPolygonId = (type: ShapeType | 'group', index: number) => {
    return `${SHAPE_NAME_PREFIX}-${type}-${index}`;
};

/**
 * Image Annotation
 */
const ImageAnnotation = forwardRef<ImageAnnotationInstance, ImageAnnotationProps>(
    (
        {
            imgSrc,
            points = [],
            rectConfig,
            polygonConfig,
            skeletonConfig,
            strokeColor = yellow[600],
            anchorFillColor = white,
            containerWidth,
            containerHeight,
            onImageLoaded,
            onImageError,
            onPointsChange,
        },
        ref,
    ) => {
        // ---------- Load Image ----------
        const [imgSize, setImgSize] = useState({
            naturalWidth: 0,
            naturalHeight: 0,
            width: 0,
            height: 0,
        });
        const [image, setImage] = useState<HTMLImageElement | null>(null);
        const [scale, setScale] = useState(1);
        const handleImageLoaded = useMemoizedFn(onImageLoaded || (() => {}));
        const handleImageError = useMemoizedFn(onImageError || (() => {}));

        // Get size of image
        useEffect(() => {
            const img = new window.Image();
            img.src = imgSrc;
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const { naturalWidth, naturalHeight } = img;
                let scale = 1;
                if (containerWidth && containerHeight) {
                    const widthRatio = containerWidth / naturalWidth;
                    const heightRatio = containerHeight / naturalHeight;
                    scale = Math.min(widthRatio, heightRatio);
                }

                const size = {
                    naturalWidth,
                    naturalHeight,
                    width: naturalWidth * scale,
                    height: naturalHeight * scale,
                };

                setScale(scale);
                setImage(img);
                setImgSize(size);
                handleImageLoaded?.(size);
            };

            img.onerror = e => {
                handleImageError?.(e);
            };

            return () => {
                img.src = '';
                img.onload = null;
                img.onerror = null;
            };
        }, [imgSrc, containerWidth, containerHeight, handleImageLoaded, handleImageError]);

        // ---------- Polygon Interaction ----------
        const [selectedId, setSelectedId] = useState<number | null>(null);
        const [editingId, setEditingId] = useState<ApiKey | null>(null);
        const transformerRef = React.useRef<any>(null);
        const editable = !!onPointsChange;

        // Colors
        const colors = useMemo(() => {
            if (Array.isArray(strokeColor)) return strokeColor;
            return Array(points.length).fill(strokeColor);
        }, [strokeColor, points.length]);

        // Enable Transformer when selected
        useEffect(() => {
            if (selectedId === null || !transformerRef.current) return;

            const node = transformerRef.current
                ?.getStage()
                ?.findOne(`.${getPolygonId('rect', selectedId)}`);
            if (node) {
                transformerRef.current.nodes([node]);
                transformerRef.current.getLayer().batchDraw();
            }
        }, [selectedId]);

        // Calculate the coordinates of the top left corner of the polygon
        const getPolygonTopLeft = useCallback(
            (points?: Vector2d[]) => {
                if (!points) return { x: 0, y: 0 };

                const point = points.reduce(
                    (acc, point) => ({
                        x: Math.min(acc.x, point.x),
                        y: Math.min(acc.y, point.y),
                    }),
                    { x: Infinity, y: Infinity },
                );

                return {
                    x: point.x - 1 / scale,
                    y: point.y - 16 / scale - 7 / scale,
                };
            },
            [scale],
        );

        // Update Position
        const handlePositionChange = useMemoizedFn((index: number, newPoints: Vector2d[]) => {
            const result = cloneDeep(points);

            result.splice(index, 1, {
                label: result[index].label,
                rect: newPoints,
            });
            onPointsChange?.(result);
        });

        // Update Label
        const handleLabelChange = useMemoizedFn((index: number, newLabel: string) => {
            const result = cloneDeep(points);

            result.splice(index, 1, {
                ...result[index],
                label: newLabel,
            });
            onPointsChange?.(result);
        });

        if (!image) return null;
        return (
            <Stage
                className="ms-image-annotation"
                ref={ref}
                width={imgSize.width}
                height={imgSize.height}
                onClick={e => {
                    const name = e.target.name();

                    if (name?.includes(SHAPE_NAME_PREFIX)) return;
                    setSelectedId(null);
                }}
            >
                <Layer scaleX={scale} scaleY={scale}>
                    <Image
                        image={image}
                        width={imgSize.naturalWidth}
                        height={imgSize.naturalHeight}
                    />

                    {points.map(({ label = '', confidence, rect, polygon, skeleton }, index) => {
                        const innerLabel = !editable
                            ? `${label}${confidence ? ` (${confidence.toFixed(2)})` : ''}`
                            : label || `#${index + 1}}`;
                        const anchorPoints = !skeleton?.length
                            ? []
                            : uniqWith(flatten(skeleton), isEqual);

                        return (
                            <Group key={getPolygonId('group', index)}>
                                {!!polygon?.length && (
                                    <Line
                                        {...defaultPolygonConfig}
                                        {...polygonConfig}
                                        closed
                                        name={getPolygonId('polygon', index)}
                                        points={polygon.flatMap(p => [p.x, p.y])}
                                        strokeWidth={1}
                                        strokeScaleEnabled={false}
                                    />
                                )}

                                {!!skeleton?.length && (
                                    <>
                                        {skeleton.map((points, idx) => (
                                            <Line
                                                {...defaultSkeletonLineConfig}
                                                {...skeletonConfig?.line}
                                                key={getPolygonId('line', idx)}
                                                name={getPolygonId('line', idx)}
                                                points={points.flatMap(p => [p.x, p.y])}
                                                strokeScaleEnabled={false}
                                            />
                                        ))}
                                        {anchorPoints.map((point, idx) => {
                                            const {
                                                width = defaultSkeletonAnchorConfig.width,
                                                height = defaultSkeletonAnchorConfig.height,
                                                radius = defaultSkeletonAnchorConfig.radius,
                                            } = skeletonConfig?.circle || {};

                                            return (
                                                <Circle
                                                    {...defaultSkeletonAnchorConfig}
                                                    {...skeletonConfig?.circle}
                                                    key={getPolygonId('circle', idx)}
                                                    name={getPolygonId('circle', idx)}
                                                    x={point.x}
                                                    y={point.y}
                                                    width={width! / scale}
                                                    height={height! / scale}
                                                    radius={radius! / scale}
                                                    strokeScaleEnabled={false}
                                                />
                                            );
                                        })}
                                    </>
                                )}

                                {!!rect?.length && (
                                    <Line
                                        {...defaultRectConfig}
                                        {...rectConfig}
                                        closed
                                        name={getPolygonId('rect', index)}
                                        points={rect.flatMap(p => [p.x, p.y])}
                                        strokeScaleEnabled={false}
                                        draggable={editable}
                                        onDragMove={() => setEditingId(index)}
                                        onDragEnd={e => {
                                            const absPos = e.target.getAbsolutePosition();
                                            const newPoints = rect.map(p => ({
                                                x: p.x + absPos.x / scale,
                                                y: p.y + absPos.y / scale,
                                            }));

                                            setEditingId(null);
                                            handlePositionChange(index, newPoints);
                                            e.target.position({ x: 0, y: 0 });
                                        }}
                                        onTransformStart={() => setEditingId(index)}
                                        onTransformEnd={e => {
                                            const node = e.target;
                                            const newPoints = rect.map((p, i) => ({
                                                x: p.x * node.scaleX() + node.x(),
                                                y: p.y * node.scaleY() + node.y(),
                                            }));

                                            // console.log({
                                            //     e,
                                            //     x: node.x(),
                                            //     y: node.y(),
                                            //     scaleX: node.scaleX(),
                                            //     scaleY: node.scaleY(),
                                            //     newPoints,
                                            // });
                                            setEditingId(null);
                                            handlePositionChange(index, newPoints);
                                            node.scaleX(1);
                                            node.scaleY(1);
                                            node.position({ x: 0, y: 0 });
                                        }}
                                        onClick={() => setSelectedId(index)}
                                    />
                                )}

                                <EditableText
                                    visible={editingId !== index}
                                    value={innerLabel}
                                    position={getPolygonTopLeft((rect || []).concat(polygon || []))}
                                    scale={scale}
                                    color={black}
                                    backgroundColor={rectConfig?.stroke || defaultRectConfig.stroke}
                                    padding={4 / scale}
                                    onChange={
                                        !editable ? undefined : val => handleLabelChange(index, val)
                                    }
                                />
                            </Group>
                        );
                    })}

                    {editable && !isNil(selectedId) && (
                        <Transformer
                            ref={transformerRef}
                            ignoreStroke
                            anchorSize={8}
                            anchorStroke={colors[selectedId ?? 0]}
                            anchorFill={anchorFillColor}
                            borderEnabled={false}
                            rotateEnabled={false}
                            boundBoxFunc={(oldBox, newBox) => newBox}
                            borderStroke={colors[selectedId ?? 0]}
                        />
                    )}
                </Layer>
            </Stage>
        );
    },
);

export type { Vector2d };
export default ImageAnnotation;
