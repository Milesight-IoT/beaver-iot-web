import React from 'react';
import { SidebarController } from '../sidebar';
import './style.less';

interface Props {
    /** Title (at center) */
    title?: React.ReactNode;

    /** Left slot */
    slotLeft?: React.ReactNode;

    /** Right slot */
    slotRight?: React.ReactNode;
}

/**
 * Topbar for mobile
 */
const MobileTopbar: React.FC<Props> = ({ title, slotLeft = <SidebarController />, slotRight }) => {
    return (
        <div className="ms-mobile-topbar">
            <div className="ms-mobile-topbar__left">{slotLeft}</div>
            <div className="ms-mobile-topbar__title">{title}</div>
            <div className="ms-mobile-topbar__right">{slotRight}</div>
        </div>
    );
};

export default MobileTopbar;
