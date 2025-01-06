import React, { useCallback } from 'react';
import cls from 'classnames';
import { ArrowForwardIosIcon } from '@milesight/shared/src/components';
import Tooltip from '@/components/tooltip';
import type { EntitySelectOption } from '../../types';
import './style.less';

interface IProps {
    option: EntitySelectOption;
    selected?: boolean;
    onClick?: (e: React.MouseEvent, option: EntitySelectOption) => void;
}
export default React.memo((props: IProps) => {
    const { option, selected, onClick } = props;
    const { label, children } = option || {};

    /** When an entity item is selected/canceled */
    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            onClick?.(e, option);
        },
        [option, onClick],
    );
    return (
        <div
            data-type="entity-menu"
            className={cls('ms-entity-menu', {
                'ms-entity-menu--active': selected,
            })}
            onClick={handleClick}
        >
            <div className="ms-entity-menu__title">
                <Tooltip title={label} autoEllipsis />
            </div>
            <div className="ms-entity-menu__icon">{!!children && <ArrowForwardIosIcon />}</div>
        </div>
    );
});
