// src/screens/Main/OrdersScreen.js
// Pantalla de Historial de Pedidos
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // Agregado Platform
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import { fetchUserOrders, selectOrdersError, selectOrdersLoading, selectUserOrders } from '../../store/slices/orderSlice';

const OrderItemCard = React.memo(({ order, onPress }) => { 
  const orderDate = new Date(order.timestamp).toLocaleDateString('es-PE', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <TouchableOpacity 
        style={[orderStyles.orderItem, { borderLeftColor: getStatusStyle(order.status).borderColor }]} 
        onPress={onPress}
        activeOpacity={0.7}
    >
      <View style={orderStyles.orderInfo}>
        <Text style={orderStyles.orderId}>Pedido ID: ...{order.id.slice(-6).toUpperCase()}</Text>
        <Text style={orderStyles.orderDate}>Fecha: {orderDate}</Text>
        <Text style={orderStyles.orderItems}>Items: {order.items.length}</Text>
        <Text style={orderStyles.orderTotal}>Total: S/ {order.totalAmount.toFixed(2)}</Text>
      </View>
      <View style={orderStyles.statusContainer}>
          <View style={[orderStyles.statusBadge, {backgroundColor: getStatusStyle(order.status).backgroundColor}]}>
            <Text style={[orderStyles.orderStatus, {color: getStatusStyle(order.status).color}]}>{order.status}</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={22} color={COLORS.gray} style={{marginTop: 5}}/>
      </View>
    </TouchableOpacity>
  );
});


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
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(() => {
    if (user?.uid) {
      dispatch(fetchUserOrders(user.uid));
    }
  }, [dispatch, user]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders();
    setTimeout(() => setRefreshing(false), 1000); 
  }, [loadOrders]);


  const renderOrderItem = ({ item }) => (
    <OrderItemCard order={item} onPress={() => Alert.alert('Detalle de Pedido', `Viendo detalle del pedido ${item.id}`)} />
  );

  if (isLoading && !refreshing && orders.length === 0) { 
    return (
      <View style={orderStyles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={orderStyles.loadingText}>Cargando tus pedidos...</Text>
      </View>
    );
  }

  if (error && !isLoading) {
    return (
      <View style={orderStyles.centered}>
        <Ionicons name="alert-circle-outline" size={60} color={COLORS.danger} />
        <Text style={orderStyles.errorText}>Error al cargar pedidos: {error}</Text>
        <TouchableOpacity style={orderStyles.retryButton} onPress={loadOrders}>
            <Text style={orderStyles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
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
            !isLoading && ( 
                <View style={orderStyles.emptyContainer}>
                    <Ionicons name="receipt-outline" size={80} color={COLORS.lightGray} />
                    <Text style={orderStyles.emptyText}>Aún no tienes pedidos.</Text>
                    <Text style={orderStyles.emptySubText}>¡Realiza tu primera compra para ver tus pedidos aquí!</Text>
                </View>
            )
        }
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }} 
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary}/>
        }
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
  loadingText: {
    marginTop: 10, 
    color: COLORS.textMuted, 
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  retryButton: {
    backgroundColor: COLORS.primary_light,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: COLORS.primary_dark,
    fontSize: 16,
    fontWeight: 'bold',
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold',
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
    fontWeight: '600', 
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  orderDate: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  orderItems: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  orderTotal: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: { 
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginBottom: 8,
    minWidth: 95, 
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold',
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  emptySubText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  }
});

export default OrdersScreen;