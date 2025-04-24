import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMemoizedFn } from 'ahooks';
import { useVirtualList } from '@milesight/shared/src/hooks';
import EntityMenuPopper from '../entity-menu-popper';
import EntityOption from '../entity-option';
import EntityMenu from '../entity-menu';
import type { EntitySelectInnerProps, EntitySelectOption } from '../../types';

interface IProps
    extends Pick<
        EntitySelectInnerProps,
        | 'tabType'
        | 'options'
        | 'maxCount'
        | 'selectedEntityMap'
        | 'selectedDeviceMap'
        | 'onEntityChange'
    > {
    children: React.ReactNode;
}
// Give a large height for popper layer positioning
const GREAT_HEIGHT = window.innerHeight;
export default React.memo((props: IProps) => {
    const {
        children: _children,
        tabType,
        options,
        selectedEntityMap,
        selectedDeviceMap,
        maxCount,
        onEntityChange,
        ...rest
    } = props;
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const [popperDiff, setPopperDiff] = useState([0, 0]);
    const [menuList, setMenuList] = useState<EntitySelectOption[]>([]);
    const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLDivElement | null>(null);
    const open = Boolean(menuAnchorEl);

    /** When clicked, the pop-up window opens */
    const handleClick = useCallback((event: React.MouseEvent, option: EntitySelectOption) => {
        const containerNode = containerRef.current!;
        const popperNode = event.currentTarget;

        const diffH =
            popperNode.getBoundingClientRect().top - containerNode.getBoundingClientRect().top;
        setPopperDiff([diffH, 0]);
        setMenuAnchorEl(containerNode);

        setTimeout(() => {
            const { children } = option || {};
            setMenuList(children || []);
        }, 0);
    }, []);

    /** virtual list */
    const [virtualList] = useVirtualList(options, {
        containerTarget: containerRef,
        wrapperTarget: listRef,
        itemHeight: tabType === 'entity' ? 58 : 38,
        overscan: 10,
    });
    const selectedCount = useMemo(() => selectedEntityMap.size, [selectedEntityMap]);

    // when scroll, clear menu list
    const handleScroll = useMemoizedFn(() => {
        if (!menuList?.length) return;

        setMenuList([]);
    });
    useEffect(() => {
        const node = containerRef.current;
        if (!node) return;

        node.addEventListener('scroll', handleScroll);
        return () => {
            node.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    useEffect(() => {
        if (tabType === 'device') return;

        // Clear the submenu when switching to the Entity tab
        setMenuAnchorEl(null);
        setMenuList([]);
    }, [tabType]);

    // Define popper modifiers
    const modifiers = useMemo(
        () => [
            {
                name: 'offset',
                options: {
                    offset: popperDiff,
                },
            },
        ],
        [popperDiff],
    );
    return (
        <>
            <div {...rest} ref={containerRef} key={tabType}>
                <div ref={listRef} style={{ height: GREAT_HEIGHT }}>
                    {(virtualList || []).map(({ data: option }) => {
                        const { value } = option || {};

                        // Only entity drop-down
                        if (tabType === 'entity') {
                            const selected = selectedEntityMap.has(value);
                            const disabled =
                                maxCount && selectedCount >= maxCount ? !selected : false;

                            return (
                                <EntityOption
                                    key={value}
                                    option={option}
                                    selected={selected}
                                    disabled={disabled}
                                    onEntityChange={onEntityChange}
                                />
                            );
                        }

                        // Drop down the device entity
                        const hasSelectedDevice = selectedDeviceMap.has((value as string) || '');
                        return (
                            <EntityMenu
                                key={value}
                                option={option}
                                onClick={handleClick}
                                selected={hasSelectedDevice}
                            />
                        );
                    })}
                </div>
            </div>
            {tabType === 'device' && (
                <EntityMenuPopper
                    open={open}
                    anchorEl={menuAnchorEl}
                    menuList={menuList}
                    modifiers={modifiers}
                    maxCount={maxCount}
                    selectedEntityMap={selectedEntityMap}
                    onEntityChange={onEntityChange}
                />
            )}
        </>
    );
});
