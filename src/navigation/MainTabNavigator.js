// src/navigation/MainTabNavigator.js
// Navegador de pestañas para las pantallas principales de la aplicación.
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';

// Importar Pantallas principales
import CartScreen from '../screens/Main/CartScreen';
import EditProfileScreen from '../screens/Main/EditProfileScreen'; // <-- NUEVA PANTALLA
import HomeScreen from '../screens/Main/HomeScreen';
import OrdersScreen from '../screens/Main/OrdersScreen';
import ProductDetailScreen from '../screens/Main/ProductDetailScreen';
import ProductsScreen from '../screens/Main/ProductsScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';
import SettingsScreen from '../screens/Main/SettingsScreen'; // <-- NUEVA PANTALLA

import { COLORS } from '../constants/colors';
import { ROUTES } from '../constants/routes';
import { selectTotalCartItems } from '../store/slices/cartSlice';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const commonStackScreenOptions = {
  headerShown: true,
  headerStyle: { 
    backgroundColor: COLORS.primary,
    elevation: 0, 
    shadowOpacity: 0, 
   },
  headerTintColor: COLORS.white,
  headerTitleStyle: { fontWeight: 'bold', fontSize: 18 }, 
  headerTitleAlign: 'center', 
};

const HomeStack = () => (
  <Stack.Navigator screenOptions={commonStackScreenOptions}>
    <Stack.Screen name={ROUTES.HOME} component={HomeScreen} options={{ title: 'PetShop Deluxe' }} />
    <Stack.Screen name={ROUTES.PRODUCT_DETAIL} component={ProductDetailScreen} />
    <Stack.Screen name={ROUTES.PRODUCTS_BY_CATEGORY} component={ProductsScreen} /> 
  </Stack.Navigator>
);

const ProductsStack = () => (
  <Stack.Navigator screenOptions={commonStackScreenOptions}>
    <Stack.Screen name={ROUTES.PRODUCTS} component={ProductsScreen} options={{ title: 'Catálogo Completo' }} />
    <Stack.Screen name={ROUTES.PRODUCT_DETAIL} component={ProductDetailScreen} />
  </Stack.Navigator>
);

const CartStack = () => (
  <Stack.Navigator screenOptions={commonStackScreenOptions}>
    <Stack.Screen name={ROUTES.CART} component={CartScreen} options={{ title: 'Mi Carrito' }} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={commonStackScreenOptions}>
    <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} options={{ title: 'Mi Cuenta' }} />
    <Stack.Screen name={ROUTES.ORDERS} component={OrdersScreen} options={{ title: 'Historial de Pedidos' }} />
    <Stack.Screen name={ROUTES.EDIT_PROFILE} component={EditProfileScreen} options={{ title: 'Editar Perfil' }} /> 
    <Stack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} options={{ title: 'Configuración' }} />
  </Stack.Navigator>
);


const MainTabNavigator = () => {
  const totalCartItems = useSelector(selectTotalCartItems); 

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, 
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === ROUTES.HOME_TAB) { 
            iconName = focused ? 'home-sharp' : 'home-outline';
          } else if (route.name === ROUTES.PRODUCTS_TAB) { 
            iconName = focused ? 'list-sharp' : 'list-outline';
          } else if (route.name === ROUTES.CART_TAB) { 
            iconName = focused ? 'cart-sharp' : 'cart-outline';
            return ( 
              <View style={tabNavStyles.iconContainer}>
                <Ionicons name={iconName} size={focused ? size + 4 : size + 2} color={color} />
                {totalCartItems > 0 && (
                  <View style={tabNavStyles.badge}>
                    <Text style={tabNavStyles.badgeText}>{totalCartItems > 9 ? '9+' : totalCartItems}</Text>
                  </View>
                )}
              </View>
            );
          } else if (route.name === ROUTES.PROFILE_TAB) { 
            iconName = focused ? 'person-sharp' : 'person-outline';
          }
          return <Ionicons name={iconName} size={focused ? size + 4 : size + 2} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary, 
        tabBarInactiveTintColor: COLORS.textMuted, 
        tabBarLabelStyle: {
          fontSize: 11, 
          fontWeight: '600', 
          marginBottom: 3, 
        },
        tabBarStyle: {
          paddingBottom: Platform.OS === 'ios' ? 2 : 5, 
          paddingTop:5,
          height: Platform.OS === 'ios' ? 85 : 65, 
          backgroundColor: COLORS.white, 
          borderTopWidth: 0.5, 
          borderTopColor: COLORS.lightGray,
          elevation: 5, 
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        },
      })}
    >
      <Tab.Screen name={ROUTES.HOME_TAB} component={HomeStack} options={{ tabBarLabel: 'Inicio' }} />
      <Tab.Screen name={ROUTES.PRODUCTS_TAB} component={ProductsStack} options={{ tabBarLabel: 'Productos' }} />
      <Tab.Screen name={ROUTES.CART_TAB} component={CartStack} options={{ tabBarLabel: 'Carrito' }} />
      <Tab.Screen name={ROUTES.PROFILE_TAB} component={ProfileStack} options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
};

const tabNavStyles = StyleSheet.create({
  iconContainer: {
    width: 30, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -10, 
    top: -5,   
    backgroundColor: COLORS.danger,
    borderRadius: 10, 
    width: 20,        
    height: 20,       
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10, 
    fontWeight: 'bold',
  },
});

export default MainTabNavigator;