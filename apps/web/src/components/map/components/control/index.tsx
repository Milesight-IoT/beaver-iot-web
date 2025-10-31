import React, { memo } from 'react';
import cls from 'classnames';
import { useMap } from 'react-leaflet';
import { POSITION_CLASSES } from '../../constants';
import PrependPortal from './prepend-portal';

interface Props extends React.PropsWithChildren {
    /**
     * Control position
     */
    position: keyof typeof POSITION_CLASSES;

    /**
     * Control root element class name
     */
    className?: string;
}

const MapControl: React.FC<Props> = memo(({ position, children, className }) => {
    const map = useMap();

    return (
        <PrependPortal
            container={() => {
                const positionClass = POSITION_CLASSES[position]
                    .split(' ')
                    .map(item => `.${item}`)
                    .join('');
                return map
                    .getContainer()
                    .querySelector(`.leaflet-control-container ${positionClass}`);
            }}
        >
            <div className={cls('leaflet-control leaflet-bar', className)}>{children}</div>
        </PrependPortal>
    );
});

export default MapControl;
