// src/screens/Main/EditProfileScreen.js
// Nueva pantalla para editar el perfil del usuario
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import { setError as setAuthError, updateUserDisplayName } from '../../store/slices/authSlice'; // Asumimos que existirá updateUserDisplayName

const EditProfileScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const isLoading = useSelector(state => state.auth.isLoading);
    const authError = useSelector(state => state.auth.error);

    const [displayName, setDisplayName] = useState(user?.displayName || '');

    useEffect(() => {
        // Limpiar error al montar o si el usuario cambia
        if (authError) {
            dispatch(setAuthError(null));
        }
    }, [dispatch, authError]);
    
    const handleSaveChanges = async () => {
        if (!user) {
            Alert.alert("Error", "Usuario no encontrado.");
            return;
        }
        if (!displayName.trim()) {
            Alert.alert("Campo Vacío", "El nombre para mostrar no puede estar vacío.");
            return;
        }

        if (authError) dispatch(setAuthError(null)); // Limpiar error previo

        console.log(`[EditProfileScreen] Guardando nuevo displayName: ${displayName} para userId: ${user.uid}`);
        const resultAction = await dispatch(updateUserDisplayName({ userId: user.uid, displayName }));

        if (updateUserDisplayName.fulfilled.match(resultAction)) {
            Alert.alert("Éxito", "Nombre de perfil actualizado correctamente.");
            navigation.goBack();
        } else if (updateUserDisplayName.rejected.match(resultAction)) {
            Alert.alert("Error", resultAction.payload || "No se pudo actualizar el nombre del perfil.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Nombre para Mostrar:</Text>
            <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={22} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Tu nombre o apodo"
                    placeholderTextColor={COLORS.gray}
                />
            </View>

            {authError && !isLoading && <Text style={styles.errorText}>{authError}</Text>}

            {isLoading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges} activeOpacity={0.7}>
                    <Ionicons name="save-outline" size={20} color={COLORS.white} style={{ marginRight: 10 }}/>
                    <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: COLORS.background,
    },
    label: {
        fontSize: 16,
        color: COLORS.textMuted,
        marginBottom: 8,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 55,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: 12,
        marginBottom: 25,
        paddingHorizontal: 15,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    saveButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: COLORS.primary_dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    },
    errorText: {
        color: COLORS.danger,
        marginBottom: 15,
        fontSize: 14,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    }
});

export default EditProfileScreen;