import React, { memo, useMemo } from 'react';
import HoverPopover from 'material-ui-popup-state/HoverPopover';
import { usePopupState, bindHover, bindPopover } from 'material-ui-popup-state/hooks';
import { genImageSource } from '@/utils';
import './style.less';

interface Props {
    /** Popover ID */
    id: ApiKey;

    /** Image URL */
    src: string;

    /** The normal image width */
    width?: string | number;
    /** The normal image height */
    height?: string | number;

    /** The preview image width */
    previewWidth?: string | number;
    /** The preview image height */
    previewHeight?: string | number;
}

const DEFAULT_NORMAL_WIDTH = 36;
const DEFAULT_NORMAL_HEIGHT = 28;
const DEFAULT_PREVIEW_WIDTH = 360;
const DEFAULT_PREVIEW_HEIGHT = 240;

/**
 *  Image preview component
 */
const ImagePreview: React.FC<Props> = memo(
    ({
        id,
        src,
        width = DEFAULT_NORMAL_WIDTH,
        height = DEFAULT_NORMAL_HEIGHT,
        previewWidth = DEFAULT_PREVIEW_WIDTH,
        previewHeight = DEFAULT_PREVIEW_HEIGHT,
    }) => {
        const popupState = usePopupState({ variant: 'popover', popupId: `${id}` });
        const normalStyle = useMemo<React.CSSProperties>(
            () => ({
                width,
                height,
            }),
            [width, height],
        );
        const previewStyle = useMemo<React.CSSProperties>(
            () => ({
                width: previewWidth,
                height: previewHeight,
            }),
            [previewWidth, previewHeight],
        );

        return (
            <>
                <div
                    className="ms-com-image-preview"
                    style={normalStyle}
                    {...bindHover(popupState)}
                >
                    <img src={genImageSource(src)} alt="preview" />
                </div>
                <HoverPopover
                    {...bindPopover(popupState)}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                >
                    <div className="ms-com-image-preview-picture" style={previewStyle}>
                        <img src={genImageSource(src)} alt="preview" />
                    </div>
                </HoverPopover>
            </>
        );
    },
);

export default ImagePreview;
