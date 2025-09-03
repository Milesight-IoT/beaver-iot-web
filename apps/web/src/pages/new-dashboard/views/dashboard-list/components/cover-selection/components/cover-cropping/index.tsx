import React from 'react';
import { IconButton } from '@mui/material';

import { AddIcon, RemoveIcon } from '@milesight/shared/src/components';

import { useCroppingData } from './hooks';

import styles from './style.module.less';

export interface CoverCroppingProps {
    image?: HTMLImageElement;
}

/**
 * Crop the cover to size
 */
const CoverCropping: React.FC<CoverCroppingProps> = props => {
    const { imageSize, canvasSize, canvasTranslate, canvasRef } = useCroppingData(props);

    return (
        <div className={styles['cover-cropping']}>
            <canvas
                ref={canvasRef}
                width={imageSize.width}
                height={imageSize.height}
                style={{
                    width: `${canvasSize.width}px`,
                    height: `${canvasSize.height}px`,
                    transform: `translate(${canvasTranslate.x}px, ${canvasTranslate.y}px)`,
                }}
            />
            <div className={styles.mask} />
            <div className={styles.control}>
                <IconButton
                    sx={{
                        color: 'white',
                        background: '#00000080',
                        borderRadius: '50%',
                        marginRight: '8px',
                    }}
                >
                    <AddIcon />
                </IconButton>
                <IconButton sx={{ color: 'white', background: '#00000080', borderRadius: '50%' }}>
                    <RemoveIcon />
                </IconButton>
            </div>
        </div>
    );
};

export default CoverCropping;
