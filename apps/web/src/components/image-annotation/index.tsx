import React, { useState, useEffect, useMemo } from 'react';
import { useMemoizedFn } from 'ahooks';
import { isNil } from 'lodash-es';
import { Stage, Layer, Image, Line, Transformer } from 'react-konva';
import { yellow, white, black } from '@milesight/shared/src/services/theme';
import type { Vector2d } from 'konva/lib/types';
import EditableText from './editable-text';
import './style.less';

interface PolygonAnnotationProps {
    /** Image source */
    imgSrc: string;
    /** Polygon points */
    points: Vector2d[][];
    /** Stroke color */
    strokeColor?: string | string[];
    /** Anchor fill color */
    anchorFillColor?: string;
    /** Container width */
    containerWidth?: number;
    /** Container height */
    containerHeight?: number;
    /** Points change callback */
    onPointsChange?: (newPoints: Vector2d[][]) => void;
}

const POLYGON_NAME_PREFIX = 'ms-polygon';
const getPolygonId = (index: number) => `${POLYGON_NAME_PREFIX}-${index}`;

/**
 * Image Annotation
 */
const ImageAnnotation = ({
    imgSrc,
    points = [],
    strokeColor = yellow[600],
    anchorFillColor = white,
    containerWidth,
    containerHeight,
    onPointsChange,
}: PolygonAnnotationProps) => {
    // ---------- Load Image ----------
    const [imgSize, setImgSize] = useState({
        naturalWidth: 0,
        naturalHeight: 0,
        width: 0,
        height: 0,
    });
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [scale, setScale] = useState(1);

    // Get size of image
    useEffect(() => {
        const img = new window.Image();
        img.src = imgSrc;
        img.onload = () => {
            const { naturalWidth, naturalHeight } = img;
            let scale = 1;
            if (containerWidth && containerHeight) {
                const widthRatio = containerWidth / naturalWidth;
                const heightRatio = containerHeight / naturalHeight;
                scale = Math.min(widthRatio, heightRatio);
            }

            setScale(scale);
            setImage(img);
            setImgSize({
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
                width: img.naturalWidth * scale,
                height: img.naturalHeight * scale,
            });
        };

        return () => {
            img.src = '';
            img.onload = null;
        };
    }, [imgSrc, containerWidth, containerHeight]);

    // ---------- Polygon Interaction ----------
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<ApiKey | null>(null);
    const transformerRef = React.useRef<any>(null);

    // Colors
    const colors = useMemo(() => {
        if (Array.isArray(strokeColor)) return strokeColor;
        return Array(points.length).fill(strokeColor);
    }, [strokeColor, points.length]);

    // Enable Transformer when selected
    useEffect(() => {
        if (selectedId === null || !transformerRef.current) return;

        const node = transformerRef.current?.getStage()?.findOne(`.${getPolygonId(selectedId)}`);
        if (node) {
            transformerRef.current.nodes([node]);
            transformerRef.current.getLayer().batchDraw();
        }
    }, [selectedId]);

    // Calculate the coordinates of the top left corner of the polygon
    const getPolygonTopLeft = (polygonPoints: Vector2d[]) => {
        return polygonPoints.reduce(
            (acc, point) => ({
                x: Math.min(acc.x, point.x),
                y: Math.min(acc.y, point.y),
            }),
            { x: Infinity, y: Infinity },
        );
    };

    // Update position
    const handlePositionChange = useMemoizedFn((index: number, newPoints: Vector2d[]) => {
        const updated = [...points];
        updated[index] = newPoints;
        onPointsChange?.(updated);
    });

    if (!image) return null;
    return (
        <Stage
            className="ms-image-annotation"
            width={imgSize.width}
            height={imgSize.height}
            onClick={e => {
                const name = e.target.name();

                if (name?.includes(POLYGON_NAME_PREFIX)) return;
                setSelectedId(null);
            }}
        >
            <Layer scaleX={scale} scaleY={scale}>
                <Image image={image} width={imgSize.naturalWidth} height={imgSize.naturalHeight} />

                {points.map((polygonPoints, index) => {
                    const topLeft = getPolygonTopLeft(polygonPoints);

                    return (
                        <React.Fragment key={getPolygonId(index)}>
                            <Line
                                closed
                                name={getPolygonId(index)}
                                points={polygonPoints.flatMap(p => [p.x, p.y])}
                                stroke={colors[index]}
                                strokeWidth={2}
                                strokeScaleEnabled={false}
                                draggable={!!onPointsChange}
                                onDragMove={() => setEditingId(index)}
                                onDragEnd={e => {
                                    const absPos = e.target.getAbsolutePosition();
                                    const newPoints = polygonPoints.map(p => ({
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
                                    const newPoints = polygonPoints.map((p, i) => ({
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

                            <EditableText
                                visible={editingId !== index}
                                value={`#${index + 1}`}
                                position={{
                                    x: topLeft.x - 1 / scale,
                                    y: topLeft.y - 16 / scale - 7 / scale,
                                }}
                                scale={scale}
                                color={black}
                                backgroundColor={colors[index]}
                                padding={4 / scale}
                            />
                        </React.Fragment>
                    );
                })}

                {!isNil(selectedId) && onPointsChange && (
                    <Transformer
                        ref={transformerRef}
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
};

export type { Vector2d };
export default ImageAnnotation;
