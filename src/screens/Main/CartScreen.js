// src/screens/Main/CartScreen.js
// Pantalla del Carrito de Compras
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import {
  clearCart,
  decrementItemQuantity,
  incrementItemQuantity,
  removeItemFromCart,
  selectCartItems,
  selectCartTotalAmount
} from '../../store/slices/cartSlice';
import { processOrder } from '../../store/slices/orderSlice';

const CartItemCard = ({ item, onRemove, onIncrement, onDecrement }) => ( 
  <View style={cartStyles.cartItem}>
    <Image source={{uri: item.imageUrl || `https://placehold.co/80x80/${COLORS.lightGray.substring(1)}/AAAAAA&text=${item.name[0]}`}} style={cartStyles.itemImage} />
    <View style={cartStyles.itemInfo}>
      <Text style={cartStyles.itemName} numberOfLines={2}>{item.name}</Text>
      <Text style={cartStyles.itemPrice}>S/ {item.price.toFixed(2)} c/u</Text>
      <Text style={cartStyles.itemSubtotal}>Subtotal: S/ {(item.price * item.quantity).toFixed(2)}</Text>
    </View>
    <View style={cartStyles.itemActions}>
        <TouchableOpacity style={cartStyles.actionButton} onPress={onDecrement}>
            <Ionicons name="remove-circle" size={30} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={cartStyles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity style={cartStyles.actionButton} onPress={onIncrement}>
            <Ionicons name="add-circle" size={30} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[cartStyles.actionButton, cartStyles.removeButton]} onPress={onRemove}>
            <Ionicons name="trash-outline" size={26} color={COLORS.danger} />
        </TouchableOpacity>
    </View>
  </View>
);

const CartScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const totalAmount = useSelector(selectCartTotalAmount);
  const currentUser = useSelector(state => state.auth.user);
  const { isLoading: isOrderLoading, error: orderError } = useSelector(state => state.orders);


  const handleRemoveItem = (itemId) => {
    Alert.alert(
      "Eliminar Producto",
      "¿Estás seguro de que quieres eliminar este producto del carrito?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sí, Eliminar", 
          style: "destructive",
          onPress: () => dispatch(removeItemFromCart(itemId))
        }
      ]
    );
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      Alert.alert("Usuario no autenticado", "Por favor, inicia sesión para continuar con tu compra.", [
        { text: "OK", onPress: () => navigation.navigate(ROUTES.PROFILE_TAB, { screen: ROUTES.PROFILE }) } 
      ]);
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Carrito Vacío", "No puedes procesar un pedido sin productos en el carrito.");
      return;
    }

    const orderData = {
      userId: currentUser.uid,
      items: cartItems,
      totalAmount: totalAmount,
      status: 'Procesando',
    };

    const resultAction = await dispatch(processOrder(orderData));

    if (processOrder.fulfilled.match(resultAction)) {
      Alert.alert("¡Pedido Realizado!", "Tu pedido ha sido procesado exitosamente.");
      dispatch(clearCart());
      navigation.navigate(ROUTES.PROFILE_TAB, { screen: ROUTES.ORDERS }); 
    } else if (processOrder.rejected.match(resultAction)) {
      Alert.alert("Error al Procesar Pedido", resultAction.payload || "Hubo un problema al procesar tu pedido. Inténtalo de nuevo.");
    }
  };


  const renderCartItem = ({ item }) => (
    <CartItemCard 
        item={item} 
        onRemove={() => handleRemoveItem(item.id)}
        onIncrement={() => dispatch(incrementItemQuantity(item.id))}
        onDecrement={() => dispatch(decrementItemQuantity(item.id))}
    />
  );


  return (
    <View style={cartStyles.container}>
      {cartItems.length === 0 ? (
        <View style={cartStyles.emptyContainer}>
            <Ionicons name="cart-outline" size={100} color={COLORS.lightGray} />
            <Text style={cartStyles.emptyCartText}>Tu carrito está vacío.</Text>
            <Text style={cartStyles.emptyCartSubText}>¡Añade productos para verlos aquí!</Text>
            <TouchableOpacity style={cartStyles.exploreButton} onPress={() => navigation.navigate(ROUTES.PRODUCTS_TAB, { screen: ROUTES.PRODUCTS })}>
                <Text style={cartStyles.exploreButtonText}>Explorar Productos</Text>
            </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={item => item.id.toString()} 
            ListHeaderComponent={<Text style={cartStyles.headerTitle}>Tu Carrito de Compras</Text>}
            contentContainerStyle={{ paddingBottom: 5 }}
          />
          <View style={cartStyles.summaryContainer}>
            {orderError && <Text style={cartStyles.errorText}>Error: {orderError}</Text>}
            <Text style={cartStyles.totalText}>Total General: S/ {totalAmount.toFixed(2)}</Text>
            {isOrderLoading ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <TouchableOpacity style={cartStyles.checkoutButton} onPress={handleCheckout}>
                  <Text style={cartStyles.checkoutButtonText}>Proceder al Pago</Text>
                  <Ionicons name="arrow-forward-circle-outline" size={24} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );
};

const cartStyles = StyleSheet.create({ 
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 15,
  },
  cartItem: {
    backgroundColor: COLORS.white,
    padding: 15,
    marginHorizontal:15,
    marginBottom:12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 15,
    borderWidth:1,
    borderColor: COLORS.lightGray,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 3,
  },
  itemPrice: {
    fontSize: 14,
    color: COLORS.gray,
  },
  itemSubtotal: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: 5,
  },
  itemActions: {
    flexDirection: 'column', 
    alignItems: 'center',
    marginLeft: 10, 
  },
  actionButton: {
    paddingVertical: 5, 
  },
  removeButton: {
    marginTop: 8, 
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: 5, 
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textMuted,
  },
  emptyCartSubText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  exploreButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exploreButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
    textAlign: 'right',
  },
  checkoutButton: {
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  errorText: { 
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  }
});

export default CartScreen;