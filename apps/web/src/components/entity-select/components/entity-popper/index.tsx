import React from 'react';
import cls from 'classnames';
import { Popper, PopperProps } from '@mui/material';
import type { EntitySelectInnerProps } from '../../types';

type IProps = PopperProps & Pick<EntitySelectInnerProps, 'dropdownMatchSelectWidth'>;
export default React.memo(({ className, style, dropdownMatchSelectWidth, ...props }: IProps) => {
    const newStyle = dropdownMatchSelectWidth
        ? { ...style, width: dropdownMatchSelectWidth }
        : style;

    return (
        <Popper {...props} className={cls('ms-entity-select-popper', className)} style={newStyle} />
    );
});
