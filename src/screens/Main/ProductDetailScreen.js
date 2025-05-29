// src/screens/Main/ProductDetailScreen.js
// Pantalla de Detalle de Producto
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // Agregado Platform
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import { addItemAndSync } from '../../store/slices/cartSlice';

const ProductDetailScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  let product = route.params?.product; 
  const productId = route.params?.productId;

  const { products, isLoading } = useSelector(state => state.products);
  if (!product && productId) {
    product = products.find(p => p.id === productId);
  }
  
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: product?.name || 'Detalle del Producto', 
    });
  }, [navigation, product]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addItemAndSync(product)); 
      Alert.alert("¡Añadido!", `${product.name} se ha añadido a tu carrito.`, [{text: "OK"}]);
    } else {
      Alert.alert("Error", "No se pudo añadir el producto al carrito.");
    }
  };

  if (isLoading && !product) {
    return (
      <View style={stylesDetail.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={stylesDetail.centered}>
        <Ionicons name="alert-circle-outline" size={60} color={COLORS.danger} />
        <Text style={stylesDetail.errorText}>Producto no encontrado.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={stylesDetail.goBackButton} activeOpacity={0.7}>
            <Text style={stylesDetail.goBackButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={stylesDetail.container}>
      <Image 
        source={{ uri: product.imageUrl || `https://placehold.co/600x400/${COLORS.primary_light.substring(1)}/${COLORS.white.substring(1)}&text=${product.name ? product.name.replace(/\s/g, '+') : `Producto`}` }} 
        style={stylesDetail.productImage} 
        onError={(e) => console.log('Error cargando imagen:', e.nativeEvent.error)}
      />
      <View style={stylesDetail.detailsContainer}>
        <Text style={stylesDetail.productName}>{product.name}</Text>
        <Text style={stylesDetail.productCategory}>Categoría: {product.categoryName || product.category}</Text>
        <Text style={stylesDetail.productPrice}>S/ {product.price.toFixed(2)}</Text>
        <Text style={stylesDetail.productStock}>
            {product.stock > 0 ? `Stock disponible: ${product.stock}` : 'Agotado'}
        </Text>
        
        <Text style={stylesDetail.descriptionHeader}>Descripción:</Text>
        <Text style={stylesDetail.productDescription}>
          {product.description || 'No hay descripción disponible para este producto.'}
        </Text>
        <TouchableOpacity 
            style={[stylesDetail.addToCartButton, product.stock === 0 && stylesDetail.disabledButton]} 
            onPress={handleAddToCart}
            disabled={product.stock === 0}
            activeOpacity={0.7}
        >
          <Ionicons name="cart-outline" size={22} color={COLORS.white} />
          <Text style={stylesDetail.addToCartButtonText}>{product.stock === 0 ? 'Producto Agotado' : 'Añadir al Carrito'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const stylesDetail = StyleSheet.create({ 
  centered: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorText: { 
    fontSize: 18,
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  goBackButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12, 
    paddingHorizontal: 30,
    borderRadius: 10, 
    elevation: 3,
  },
  goBackButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  productImage: {
    width: '100%',
    height: 320,
    resizeMode: 'cover',
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.lightGray,
  },
  detailsContainer: {
    padding: 20,
  },
  productName: {
    fontSize: 26,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold',
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  productCategory: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  productPrice: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold',
  },
  productStock: {
    fontSize: 15,
    color: COLORS.success, 
    marginBottom: 20,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  descriptionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10, 
    marginTop:10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  productDescription: {
    fontSize: 16,
    color: COLORS.textMuted,
    lineHeight: 24,
    marginBottom: 30,
    textAlign: 'justify',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  addToCartButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12, 
    shadowColor: COLORS.primary_dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  addToCartButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  disabledButton: { 
    backgroundColor: COLORS.gray,
    elevation: 0,
    shadowOpacity: 0,
  }
});

export default ProductDetailScreen;