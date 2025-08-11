import React, { useRef } from 'react';
import { useVirtualList } from '@milesight/shared/src/hooks';
import { ValueSelectInnerProps } from '../../../../types';
import { SelectValueOptionType } from '../../../../../../../../types';
import RowOption from '../row-option';

type IProps<T extends SelectValueOptionType> = Pick<
    ValueSelectInnerProps<T>,
    'options' | 'selectedMap' | 'onItemChange' | 'renderOption'
>;

export default React.memo((props: IProps<SelectValueOptionType>) => {
    const { options, selectedMap, onItemChange, renderOption, ...rest } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    /** virtual list */
    const [virtualList] = useVirtualList(options, {
        containerTarget: containerRef,
        wrapperTarget: listRef,
        itemHeight: 38,
        overscan: 10,
    });

    return (
        <div {...rest} ref={containerRef}>
            <div ref={listRef}>
                {(virtualList || []).map(({ data: option }) => {
                    const selected = selectedMap.has(option.value);
                    return renderOption ? (
                        renderOption({
                            option,
                            selected,
                            onClick: onItemChange,
                        })
                    ) : (
                        <RowOption
                            key={option.value}
                            option={option}
                            selected={selected}
                            onChange={onItemChange}
                        />
                    );
                })}
            </div>
        </div>
    );
});
