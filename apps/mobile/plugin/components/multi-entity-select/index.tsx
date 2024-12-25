import React, { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
// @ts-ignore
import useI18n from '@milesight/shared/src/hooks/useI18n';
import MultiSelect from 'react-native-multiple-select';
import { useEntitySelectOptions } from '../../hooks';
import { Box } from '@ms-mobile-ui/themed';

type EntityOptionType = {
    label: string;
    value: string;
    description: string;
};

type EntitySelectProps = {
    value: EntityOptionType[];
    onChange: (value: EntityOptionType[]) => void;
    entityType: string;
    entityValueTypes: string[];
    entityAccessMods: string[];
    entityExcludeChildren: boolean;
    customFilterEntity?: (entity: EntityOptionType) => boolean;
    maxCount?: number;
};

const MultiEntitySelect = (props: EntitySelectProps) => {
    const {
        value,
        onChange,
        entityType,
        entityValueTypes,
        entityAccessMods,
        entityExcludeChildren,
        customFilterEntity,
    } = props;

    const { getIntlText } = useI18n();
    const { width } = useWindowDimensions();

    const {
        loading,
        getEntityOptions,
        options = [],
    } = useEntitySelectOptions({
        // @ts-ignore
        entityType,
        // @ts-ignore
        entityValueTypes,
        // @ts-ignore
        entityAccessMods,
        // @ts-ignore
        entityExcludeChildren,
        // @ts-ignore
        customFilterEntity,
    });

    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    useEffect(() => {
        setSelectedItems(value?.map(item => item.value));
    }, [value]);

    const onSelectedItemsChange = (selectedItems: string[]) => {
        const selectedOptions = options.filter(option => selectedItems.includes(String(option.value)));
        // @ts-ignore
        onChange(selectedOptions);
        setSelectedItems(selectedItems);
    };

    return (
        <Box w='100%' bg='#fff' py='$1'>
            <MultiSelect
                items={options}
                fixedHeight
                uniqueKey="value"
                displayKey="label"
                onSelectedItemsChange={onSelectedItemsChange}
                selectedItems={selectedItems}
                selectText="Choose some entities..."
                searchInputPlaceholderText="Search entities..."
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#3f51b5"
                selectedItemIconColor="#3f51b5"
                itemTextColor="#000"
                searchInputStyle={{ color: '#CCC' }}
                submitButtonColor="#3f51b5"
                hideSubmitButton
                submitButtonText={getIntlText('common.button.confirm')}
            />
        </Box>
    );
};

export default MultiEntitySelect;

