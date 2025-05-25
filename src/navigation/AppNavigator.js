// src/navigation/AppNavigator.js
// Navegador principal que decide qué stack de navegación mostrar (Autenticación o Principal).
import { ActivityIndicator, StyleSheet, View } from 'react-native'; // Para el indicador de carga
import { useSelector } from 'react-redux';
import { COLORS } from '../constants/colors';
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';


const AppNavigator = () => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const isLoadingAuth = useSelector(state => state.auth.isLoading); // Para el estado de carga de auth

  if (isLoadingAuth) {
    // Muestra un indicador de carga mientras se verifica el estado de autenticación
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return isAuthenticated ? <MainTabNavigator /> : <AuthStack />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

export default AppNavigator;