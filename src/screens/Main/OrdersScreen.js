// src/screens/Main/OrdersScreen.js
// Pantalla de Historial de Pedidos
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // Agregado Button
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import { fetchUserOrders, selectOrdersError, selectOrdersLoading, selectUserOrders } from '../../store/slices/orderSlice';

const OrderItemCard = ({ order, onPress }) => { 
  const orderDate = new Date(order.timestamp).toLocaleDateString('es-PE', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <TouchableOpacity style={[orderStyles.orderItem, { borderLeftColor: getStatusStyle(order.status).borderColor }]} onPress={onPress}>
      <View style={orderStyles.orderInfo}>
        <Text style={orderStyles.orderId}>Pedido ID: ...{order.id.slice(-6).toUpperCase()}</Text>
        <Text style={orderStyles.orderDate}>Fecha: {orderDate}</Text>
        <Text style={orderStyles.orderItems}>Items: {order.items.length}</Text>
        <Text style={orderStyles.orderTotal}>Total: S/ {order.totalAmount.toFixed(2)}</Text>
      </View>
      <View style={orderStyles.statusContainer}>
          <Text style={[orderStyles.orderStatus, getStatusStyle(order.status)]}>{order.status}</Text>
          <Ionicons name="chevron-forward-outline" size={22} color={COLORS.gray} />
      </View>
    </TouchableOpacity>
  );
};


const getStatusStyle = (status) => {
  switch (status) {
    case 'Entregado':
      return { color: COLORS.success, borderColor: COLORS.success, backgroundColor: '#E8F5E9' };
    case 'En Camino':
      return { color: COLORS.warning, borderColor: COLORS.warning, backgroundColor: '#FFF8E1' };
    case 'Procesando':
      return { color: COLORS.info, borderColor: COLORS.info, backgroundColor: '#E1F5FE' };
    case 'Cancelado':
      return { color: COLORS.danger, borderColor: COLORS.danger, backgroundColor: '#FFEBEE' };
    default:
      return { color: COLORS.gray, borderColor: COLORS.gray, backgroundColor: COLORS.lightGray };
  }
};

const OrdersScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const orders = useSelector(selectUserOrders);
  const isLoading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchUserOrders(user.uid));
    }
  }, [dispatch, user]);

  const renderOrderItem = ({ item }) => (
    <OrderItemCard order={item} onPress={() => Alert.alert('Detalle de Pedido', `Viendo detalle del pedido ${item.id}`)} />
  );

  if (isLoading) {
    return (
      <View style={orderStyles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{marginTop: 10, color: COLORS.textMuted}}>Cargando tus pedidos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={orderStyles.centered}>
        <Ionicons name="alert-circle-outline" size={60} color={COLORS.danger} />
        <Text style={orderStyles.errorText}>Error al cargar pedidos: {error}</Text>
        <Button title="Reintentar" onPress={() => user?.uid && dispatch(fetchUserOrders(user.uid))} color={COLORS.primary} />
      </View>
    );
  }


  return (
    <View style={orderStyles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={<Text style={orderStyles.headerTitle}>Mis Pedidos</Text>}
        ListEmptyComponent={
            <View style={orderStyles.emptyContainer}>
                <Ionicons name="receipt-outline" size={80} color={COLORS.lightGray} />
                <Text style={orderStyles.emptyText}>Aún no tienes pedidos.</Text>
                <Text style={orderStyles.emptySubText}>¡Realiza tu primera compra para ver tus pedidos aquí!</Text>
            </View>
        }
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }} 
        refreshing={isLoading} 
        onRefresh={() => user?.uid && dispatch(fetchUserOrders(user.uid))} 
      />
    </View>
  );
};

const orderStyles = StyleSheet.create({ 
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: 15,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
   headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom:15,
  },
  orderItem: {
    backgroundColor: COLORS.white,
    paddingVertical: 15,
    paddingHorizontal: 18,
    marginHorizontal:15,
    marginBottom:12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16, 
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  orderItems: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    textAlign: 'center',
    marginBottom: 8,
    minWidth: 95, 
    textTransform: 'uppercase',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textMuted,
  },
  emptySubText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 8,
  }
});

export default OrdersScreen;