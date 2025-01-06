import React, { useCallback } from 'react';
import cls from 'classnames';
import { CheckIcon } from '@milesight/shared/src/components';
import Tooltip from '@/components/tooltip';
import type { EntitySelectInnerProps, EntitySelectOption } from '../../types';
import './style.less';

interface IProps extends Pick<EntitySelectInnerProps, 'onEntityChange'> {
    option: EntitySelectOption;
    selected?: boolean;
    disabled?: boolean;
}
export default React.memo((props: IProps) => {
    const { option, selected, disabled, onEntityChange } = props;
    const { label, description } = option || {};

    /** When an entity item is selected/canceled */
    const handleClick = useCallback(() => {
        if (disabled) return;

        onEntityChange(option);
    }, [disabled, onEntityChange, option]);

    /** when mouse down, prevent default behavior */
    const handleMouseDown = useCallback((event: React.MouseEvent) => {
        event.preventDefault();
    }, []);
    return (
        <div
            className={cls('ms-entity-content', {
                'ms-entity-content--active': selected,
                'ms-entity-content--disabled': disabled,
            })}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
        >
            <div className="ms-entity-option">
                <div className="ms-entity-option__title">
                    <Tooltip title={label} autoEllipsis />
                </div>
                {description && (
                    <div className="ms-entity-option__description">
                        <Tooltip title={description} autoEllipsis />
                    </div>
                )}
            </div>
            {selected && <CheckIcon />}
        </div>
    );
});
