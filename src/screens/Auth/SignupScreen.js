// src/screens/Auth/SignupScreen.js
// Pantalla de Registro
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { registerUser, setError as setAuthError } from '../../store/slices/authSlice';


const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.auth);


  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Campos incompletos', 'Por favor, completa todos los campos.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña Débil', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error de Contraseña', 'Las contraseñas no coinciden.');
      return;
    }
    if (error) dispatch(setAuthError(null)); // Limpiar error previo

    const resultAction = await dispatch(registerUser({ email, password }));
    if (registerUser.fulfilled.match(resultAction)) {
      Alert.alert('Registro Exitoso', 'Tu cuenta ha sido creada. Ahora serás redirigido para iniciar sesión.');
    } else if (registerUser.rejected.match(resultAction)) {
       Alert.alert('Error de Registro', resultAction.payload || 'No se pudo crear la cuenta. Inténtalo de nuevo o verifica si el correo ya está en uso.');
    }
  };

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{flex: 1}}
    >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
            <Ionicons name="clipboard-outline" size={70} color={COLORS.primary} style={styles.logo} />
            <Text style={styles.title}>Crea tu Cuenta</Text>
            <Text style={styles.subtitle}>Únete a la comunidad PetShop</Text>
            
            {error && !isLoading && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={22} color={COLORS.gray} style={styles.inputIcon} />
            <TextInput
                style={styles.input}
                placeholder="Correo Electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={COLORS.gray}
            />
            </View>
            
            <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={22} color={COLORS.gray} style={styles.inputIcon} />
            <TextInput
                style={styles.input}
                placeholder="Contraseña (mín. 6 caracteres)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor={COLORS.gray}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordIcon}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color={COLORS.gray} />
            </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={22} color={COLORS.gray} style={styles.inputIcon} />
            <TextInput
                style={styles.input}
                placeholder="Confirmar Contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor={COLORS.gray}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.showPasswordIcon}>
                <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={24} color={COLORS.gray} />
            </TouchableOpacity>
            </View>

            {isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
            ) : (
            <TouchableOpacity style={styles.button} onPress={handleSignup} activeOpacity={0.7}>
                <Text style={styles.buttonText}>Registrarse</Text>
            </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)} disabled={isLoading} activeOpacity={0.7}>
            <Text style={styles.linkText}>¿Ya tienes cuenta? <Text style={styles.linkTextBold}>Inicia Sesión</Text></Text>
            </TouchableOpacity>
        </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    // flex: 1, // Quitar para que ScrollView maneje la altura
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: COLORS.background,
  },
  logo: {
    marginBottom: 20, 
  },
  title: {
    fontSize: 28,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginBottom: 30, 
    textAlign: 'center',
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
    marginBottom: 20,
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
  showPasswordIcon: {
    padding: 5,
  },
  button: {
    width: '100%',
    height: 55,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: COLORS.primary_dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  linkText: {
    color: COLORS.textMuted,
    fontSize: 15,
    marginTop: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  linkTextBold: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 25,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.danger,
    marginBottom: 15,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  }
});

export default SignupScreen;