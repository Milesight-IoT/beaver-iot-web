import React, { useCallback } from 'react';
import cls from 'classnames';
import { CheckIcon } from '@milesight/shared/src/components';
import Tooltip from '@/components/tooltip';
import { SelectValueOptionType } from '../../../../../../../../types';
import { ValueSelectInnerProps } from '../../../../types';

import './style.less';

interface IProps<T extends SelectValueOptionType> {
    option: T;
    selected?: boolean;
    onChange: ValueSelectInnerProps<T>['onItemChange'];
}

export default React.memo(<T extends SelectValueOptionType>(props: IProps<T>) => {
    const { option, selected, onChange } = props;
    const { label } = option || {};

    /** When an entity item is selected/canceled */
    const handleClick = useCallback(
        (event: React.SyntheticEvent) => {
            onChange(event, option);
        },
        [onChange, option],
    );

    /** when mouse down, prevent default behavior */
    const handleMouseDown = useCallback((event: React.MouseEvent) => {
        event.preventDefault();
    }, []);

    return (
        <div
            className={cls('ms-advanced-filter-select', {
                'ms-advanced-filter-select-active': selected,
            })}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
        >
            <div className="ms-advanced-filter-select-option">
                <div className="ms-advanced-filter-select-option-title">
                    <Tooltip title={label} autoEllipsis />
                </div>
            </div>
            {selected && <CheckIcon />}
        </div>
    );
});
