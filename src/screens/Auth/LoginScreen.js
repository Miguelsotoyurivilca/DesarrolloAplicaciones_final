// src/screens/Auth/LoginScreen.js
// Pantalla de Inicio de Sesión
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { loginUser, setError as setAuthError } from '../../store/slices/authSlice';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.auth);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos incompletos', 'Por favor, ingresa tu correo y contraseña.');
      return;
    }
    if (error) dispatch(setAuthError(null)); 
    
    const resultAction = await dispatch(loginUser({ email, password }));
    if (loginUser.rejected.match(resultAction)) {
      Alert.alert('Error de Inicio de Sesión', resultAction.payload || 'No se pudo iniciar sesión. Verifica tus credenciales e inténtalo de nuevo.');
    }
  };

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{flex: 1}}
    >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
            <Ionicons name="paw-sharp" size={80} color={COLORS.primary} style={styles.logo} />
            <Text style={styles.title}>Bienvenido de Nuevo</Text>
            <Text style={styles.subtitle}>Ingresa a tu cuenta para continuar</Text>
            
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
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor={COLORS.gray}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordIcon}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color={COLORS.gray} />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
            ) : (
                <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.7}>
                <Text style={styles.buttonText}>Ingresar</Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.SIGNUP)} disabled={isLoading} activeOpacity={0.7}>
                <Text style={styles.linkText}>¿No tienes cuenta? <Text style={styles.linkTextBold}>Regístrate</Text></Text>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: COLORS.background,
  },
  logo: {
    marginBottom: 25,
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
    marginBottom: 35,
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
    paddingHorizontal:10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  }
});

export default LoginScreen;