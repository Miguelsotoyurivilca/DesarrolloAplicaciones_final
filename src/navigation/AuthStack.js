// src/navigation/AuthStack.js
// Stack de navegación para las pantallas de autenticación (Login, Signup).
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';
// import WelcomeScreen from '../screens/Auth/WelcomeScreen'; // Opcional
import { ROUTES } from '../constants/routes';

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.LOGIN} // O ROUTES.WELCOME si existe
      screenOptions={{
        headerShown: false, // Ocultar header por defecto en el stack de autenticación
      }}
    >
      {/* <Stack.Screen name={ROUTES.WELCOME} component={WelcomeScreen} /> */}
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.SIGNUP} component={SignupScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;