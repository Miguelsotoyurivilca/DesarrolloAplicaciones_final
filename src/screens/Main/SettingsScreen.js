// src/screens/Main/SettingsScreen.js
// Nueva pantalla para Configuración (placeholder)
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';

const SettingsScreen = () => {
    return (
        <View style={styles.container}>
            <Ionicons name="settings-outline" size={60} color={COLORS.primary_light} />
            <Text style={styles.title}>Configuración</Text>
            <Text style={styles.subtitle}>Esta pantalla estará disponible próximamente.</Text>
            {/* Aquí podrías añadir opciones de configuración en el futuro */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.background,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: 20,
        marginBottom: 10,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textMuted,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
});

export default SettingsScreen;