import { forwardRef, useMemo, useState, useEffect, useRef } from 'react';
import cls from 'classnames';
import { isUndefined } from 'lodash-es';
import { useI18n, useVirtualList } from '@milesight/shared/src/hooks';
import Tooltip from '../tooltip';
import type { ValueType } from './typings';

interface Props {
    /** Whether multiple selection is enabled */
    multiple?: boolean;
    /** Class name for the component */
    className?: string;
    /** All tags */
    tags?: ValueType[];
    /** The tags that filtered by search keyword */
    searchTags?: ValueType[];
    /** The value of the component */
    value?: ValueType | ValueType[];
    /** The tags that selected */
    onSelectedChange?: (value: ValueType | ValueType[]) => void;
}

const List = forwardRef<HTMLDivElement, Props>(
    ({ multiple, className, tags, searchTags, value, onSelectedChange, ...props }, ref) => {
        const { getIntlText } = useI18n();

        // ---------- Virtual List ----------
        const containerRef = useRef<HTMLDivElement>(null);
        const wrapperRef = useRef<HTMLDivElement>(null);
        const memoTags = useMemo(() => tags || [], [tags]);
        const [vTags] = useVirtualList(memoTags, {
            containerTarget: containerRef,
            wrapperTarget: wrapperRef,
            itemHeight: 36,
            overscan: 10,
        });

        // ---------- Interactions ----------
        const handleSelect = (data: ValueType) => {
            if (!multiple) {
                onSelectedChange?.(data);
                return;
            }
            const values = !value ? [] : Array.isArray(value) ? value : [value];
            const selected = !!values.find(v => v.id === data.id);
            if (selected) {
                onSelectedChange?.(values.filter(v => v.id !== data.id));
            } else {
                onSelectedChange?.([...values, data]);
            }
        };

        return (
            <div ref={ref} className={cls('ms-tag-select-listbox', className)} {...props}>
                <div
                    className={cls('data-list-root', 'data-list-search', {
                        'd-block': !isUndefined(searchTags),
                    })}
                >
                    {!searchTags?.length && (
                        <div className="ms-tag-select__empty">
                            {getIntlText('common.label.no_options')}
                        </div>
                    )}
                    <div className="tag-list">
                        {searchTags?.map(item => {
                            const values = !value ? [] : Array.isArray(value) ? value : [value];
                            const selected = !!values.find(v => v.id === item.id);

                            return (
                                <div
                                    key={item.id}
                                    className={cls('tag-item', { active: selected })}
                                    onClick={() => handleSelect(item)}
                                >
                                    <Tooltip
                                        autoEllipsis
                                        className="tag-item-name"
                                        title={item.name}
                                    />
                                    <div className="tag-item-count">
                                        {getIntlText('workflow.label.entity_count', {
                                            1: item.tagged_entities_count,
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div
                    ref={containerRef}
                    className={cls('data-list-root', {
                        empty: !tags?.length,
                        'd-none': !isUndefined(searchTags),
                    })}
                >
                    {!tags?.length && (
                        <div className="ms-tag-select__empty">
                            {getIntlText('common.label.no_options')}
                        </div>
                    )}
                    <div ref={wrapperRef} className="tag-list">
                        {vTags.map(({ data }) => {
                            const values = !value ? [] : Array.isArray(value) ? value : [value];
                            const selected = !!values.find(v => v.id === data.id);

                            return (
                                <div
                                    key={data.id}
                                    className={cls('tag-item', { active: selected })}
                                    onClick={() => handleSelect(data)}
                                >
                                    <Tooltip
                                        autoEllipsis
                                        className="tag-item-name"
                                        title={data.name}
                                    />
                                    <div className="tag-item-count">
                                        {getIntlText('workflow.label.entity_count', {
                                            1: data.tagged_entities_count,
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    },
);

export default List;
