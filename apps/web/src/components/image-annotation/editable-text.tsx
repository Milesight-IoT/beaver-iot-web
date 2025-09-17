import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useControllableValue } from 'ahooks';
import Konva from 'konva';
import { Tag, Text, Label } from 'react-konva';
import { Html } from 'react-konva-utils';
import type { Vector2d } from 'konva/lib/types';
import type { ShapeConfig } from 'konva/lib/Shape';
import { yellow, white, black } from '@milesight/shared/src/services/theme';

interface Props {
    /** Text value */
    value?: string;

    /** Visible or not */
    visible?: boolean;

    /** Text position */
    position?: Vector2d;

    /** Text scale */
    scale?: number;

    /** Text color */
    color?: string;

    /** Text padding */
    padding?: number;

    /** Text font size */
    fontSize?: number;

    /** Background */
    backgroundColor?: ShapeConfig['stroke'];

    /** Content change Callback */
    onChange?: (content: string) => void;
}

/** Default scale */
const DEFAULT_SCALE = 1;

/** Default font size */
const DEFAULT_TEXT_SIZE = 16;

/** Default text padding */
const DEFAULT_TEXT_PADDING = 4;

const MIN_INPUT_WIDTH = 50;
const MAX_INPUT_WIDTH = 200;

const EditableText: React.FC<Props> = ({
    value,
    visible,
    position,
    scale = DEFAULT_SCALE,
    color = black,
    padding = DEFAULT_TEXT_PADDING,
    fontSize = DEFAULT_TEXT_SIZE,
    backgroundColor = yellow[600],
    onChange,
}) => {
    // ---------- Render Text value ----------
    const [text, setText] = useControllableValue({ value, onChange });

    // ---------- Text Editing state ----------
    const labelRef = useRef<Konva.Label>(null);
    const [isEditing, setIsEditing] = useState(false);
    const isEditable = !!onChange;

    const handleDoubleClick = useCallback(() => {
        if (!isEditable) return;
        setIsEditing(true);
    }, [isEditable]);

    // ---------- Render input ----------
    const [inputText, setInputText] = useState(text);
    const inputRef = useRef<HTMLInputElement>(null);
    const innerPosition = useMemo(
        () => ({
            x: !position?.x || position.x < 0 ? 0 : position.x,
            y: !position?.y || position.y < 0 ? 0 : position.y,
        }),
        [position],
    );
    const inputStyle = useMemo(() => {
        const labelNode = labelRef.current;
        const result: React.CSSProperties = { display: 'none' };

        if (!isEditing || !labelNode) return result;
        result.display = 'block';
        result.position = 'absolute';
        result.top = `${innerPosition.y}px`;
        result.left = `${innerPosition.x}px`;
        result.width = `${labelNode.width()}px`;
        result.minWidth = `${MIN_INPUT_WIDTH / scale}px`;
        result.maxWidth = `${MAX_INPUT_WIDTH / scale}px`;
        result.height = `${labelNode.height()}px`;
        result.margin = '0px';
        result.padding = `${padding}px`;

        result.color = color;
        result.fontSize = `${fontSize / scale}px`;
        result.border = `1px solid ${backgroundColor}`;
        result.background = white;
        result.outline = 'none';
        result.lineHeight = `${labelNode.height() - 2}px`;
        result.transformOrigin = 'left top';

        let transform = '';
        const rotation = labelRef.current?.rotation();
        if (rotation) transform += `rotateZ(${rotation}deg)`;
        result.transform = transform;

        return result;
    }, [backgroundColor, color, fontSize, padding, innerPosition, scale, isEditing]);

    const handleInputKeyDown = (e: any) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            setText(inputText);
            setIsEditing(false);
        }
        if (e.key === 'Escape') {
            setInputText(text);
            setIsEditing(false);
        }
    };

    useEffect(() => {
        setInputText(text);
    }, [text]);

    useEffect(() => {
        if (!isEditing || !inputRef.current) return;

        inputRef.current.focus();
    }, [isEditing]);

    if (!value) return null;
    return (
        <>
            <Label
                ref={labelRef}
                x={innerPosition.x}
                y={innerPosition.y}
                visible={visible && !isEditing}
                onDblClick={handleDoubleClick}
                onDblTap={handleDoubleClick}
            >
                <Tag fill={backgroundColor} />
                <Text
                    y={2}
                    verticalAlign="middle"
                    fill={color}
                    text={text}
                    fontSize={fontSize / scale}
                    padding={padding}
                />
            </Label>
            {isEditing && (
                <Html>
                    <input
                        ref={inputRef}
                        value={inputText}
                        style={inputStyle}
                        onBlur={() => {
                            setText(inputText);
                            setIsEditing(false);
                        }}
                        onKeyDown={handleInputKeyDown}
                        onChange={e => {
                            setInputText(e.target.value);
                        }}
                    />
                </Html>
            )}
        </>
    );
};

export default EditableText;
