import { useCallback, useMemo } from 'react';
import { isNull } from 'lodash-es';
import { ValueSelectProps, ValueSelectInnerProps } from '../../../types';
import { SelectValueOptionType } from '../../../../../../../types';

type IProps<
    Value extends SelectValueOptionType = SelectValueOptionType,
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false,
> = Pick<
    ValueSelectInnerProps<Value, Multiple, DisableClearable>,
    'value' | 'multiple' | 'onChange' | 'optionsMap' | 'onSearch'
>;

/**
 * Select list selected about hooks
 */
const useSelectedValue = <
    V extends SelectValueOptionType = SelectValueOptionType,
    M extends boolean | undefined = false,
    D extends boolean | undefined = false,
>(
    props: IProps<V, M, D>,
) => {
    const { value, multiple, optionsMap, onChange, onSearch } = props;

    const valueList = useMemo<V[]>(() => {
        return (Array.isArray(value) ? value : [value]).filter(v => !isNull(v));
    }, [value]);

    /** Selected value map */
    const selectedMap: ValueSelectInnerProps<V>['selectedMap'] = useMemo(() => {
        if (!valueList?.length) {
            return new Map();
        }

        return valueList.reduce((acc: ValueSelectInnerProps<V>['selectedMap'], curr: V) => {
            const option = optionsMap.get(curr.value);
            if (!option) return acc;

            acc.set(curr.value, option);
            return acc;
        }, new Map());
    }, [optionsMap, valueList]);

    /** Select/Cancel selection callback */
    const onItemChange = useCallback(
        (selectedItem: V) => {
            // When elected, clear the search content
            onSearch?.('');
            if (!multiple) {
                // single select
                onChange?.(selectedItem as ValueSelectProps<V, M, D>['value']);
                return;
            }

            // multiple select
            if (selectedMap.has(selectedItem.value)) {
                selectedMap.delete(selectedItem.value);
            } else {
                selectedMap.set(selectedItem.value, selectedItem);
            }
            onChange(Array.from(selectedMap.values()) as ValueSelectProps<V, M, D>['value']);
        },
        [multiple, onChange, selectedMap],
    );

    return {
        selectedMap,
        onItemChange,
    };
};

export default useSelectedValue;
