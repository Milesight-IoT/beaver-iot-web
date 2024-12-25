import React from 'react';
import { Switch as ThemedSwitch } from '@ms-mobile-ui/themed';
import { View, Text, StyleSheet } from 'react-native';

type SwitchProps =  {
    title?: string;
    className?: string;
    value?: boolean;
    onToggle?: (value: boolean) => void;
};

const Switch = (props: SwitchProps) => {
    const { title, className, value, onToggle, ...rest } = props;

    return (
        <View style={[styles.container]}>
            <ThemedSwitch
                value={value}
                onToggle={onToggle}
                {...rest}
            />
            {title && <Text style={styles.label}>{title}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        marginLeft: 8,
    },
});

export default Switch;
