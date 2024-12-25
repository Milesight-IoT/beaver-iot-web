import React, { useEffect, useState } from 'react';
import {
    Select as ThemedSelect,
    SelectTrigger,
    SelectInput,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicatorWrapper,
    SelectDragIndicator,
    SelectItem,
} from '@ms-mobile-ui/themed';
import { View, Text, StyleSheet } from 'react-native';

type OptionsProps = {
    label: string;
    value: string;
    isDisabled?: boolean;
};

type Props = {
    /**
     * 下拉选项
     */
    options: OptionsProps[];
    /**
     * 标题
     */
    title?: string;
    /**
     * 样式
     */
    style?: any;
    /**
     * onChange
     */
    onChange?: (value: string | undefined) => void;
};

export type SelectProps = Props;

const Select = (props: SelectProps) => {
    const { options, style, title, onChange, ...rest } = props;
    const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined);

    useEffect(() => {
        onChange?.(selectedValue);
    }, [selectedValue]);

    return (
        <View style={[styles.container, style]}>
            {!!title && <Text style={styles.label}>{title}</Text>}
            <ThemedSelect {...rest} selectedValue={selectedValue} onValueChange={setSelectedValue}>
                <SelectTrigger variant="outline" size="md">
                    <SelectInput placeholder="Select option" />
                </SelectTrigger>
                <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                        <SelectDragIndicatorWrapper>
                            <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        {options.map((option) => (
                            <SelectItem
                                label={option.label}
                                value={option.value}
                                key={option.value}
                                isDisabled={option.isDisabled}
                            />
                        ))}
                    </SelectContent>
                </SelectPortal>
            </ThemedSelect>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {
        marginBottom: 8,
    },
});

export default Select;
