import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MapScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Map view is available on mobile devices.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 18,
        color: '#64748b',
    },
});
