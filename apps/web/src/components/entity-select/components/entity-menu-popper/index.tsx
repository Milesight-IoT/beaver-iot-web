import React, { useEffect, useMemo, useRef } from 'react';
import { Paper, Popper, PopperProps } from '@mui/material';
import { useVirtualList } from '@milesight/shared/src/hooks';
import EntityOption from '../entity-option';
import type { EntitySelectInnerProps, EntitySelectOption } from '../../types';
import './style.less';

interface IProps
    extends PopperProps,
        Pick<EntitySelectInnerProps, 'maxCount' | 'selectedEntityMap' | 'onEntityChange'> {
    menuList: EntitySelectOption[];
}
const LINE_HEIGHT = 58;
export default React.memo((props: IProps) => {
    const { menuList, maxCount, selectedEntityMap, onEntityChange, ...rest } = props;
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    /** virtual list */
    const [virtualList, scrollTo] = useVirtualList(menuList, {
        containerTarget: containerRef,
        wrapperTarget: listRef,
        itemHeight: LINE_HEIGHT,
        overscan: 10,
    });
    useEffect(() => {
        scrollTo(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [menuList]);

    const selectedCount = useMemo(() => selectedEntityMap.size, [selectedEntityMap]);
    return (
        <Popper placement="right-start" {...rest} className="ms-entity-menu-popper">
            <Paper className="ms-entity-menu-paper">
                <div
                    ref={containerRef}
                    className="ms-entity-menu-paper__list"
                    style={{ height: Math.min(menuList.length, 6) * LINE_HEIGHT }}
                >
                    <div ref={listRef}>
                        {(virtualList || []).map(({ data: menu }) => {
                            const { value } = menu || {};
                            const selected = selectedEntityMap.has(value);
                            const disabled =
                                maxCount && selectedCount >= maxCount ? !selected : false;

                            return (
                                <EntityOption
                                    option={menu}
                                    selected={selected}
                                    disabled={disabled}
                                    onEntityChange={onEntityChange}
                                />
                            );
                        })}
                    </div>
                </div>
            </Paper>
        </Popper>
    );
});
