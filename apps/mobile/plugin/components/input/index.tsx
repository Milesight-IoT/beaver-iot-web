import React, { useState, useEffect } from 'react';
import { TextInput, TextInputProps, View, Text, StyleSheet } from 'react-native';

type InputType = TextInputProps & {
    title?: string;
    sx?: any;
};

const Input = (props: InputType) => {
    const { sx, title, style, onChange, value, ...rest } = props;
    const [currentValue, setCurrentValue] = useState(value);

    useEffect(() => {
        if (value !== undefined && value !== null) {
            setCurrentValue(value);
        }
    }, [value]);

    return (
        <View style={[styles.container]}>
            {!!title && <Text style={styles.label}>{title}</Text>}
            <TextInput
                value={currentValue}
                onChangeText={(text) => {
                    setCurrentValue(text);
                    // @ts-expect-error
                    onChange?.(text);
                }}
                {...rest}
                style={[styles.input, sx]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 16,
    },
    label: {
        marginBottom: 8,
        fontSize: 16,
        color: '#000',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 8,
    },
});

export default Input;
