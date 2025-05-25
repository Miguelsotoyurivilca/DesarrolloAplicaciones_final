// src/screens/Main/ProductDetailScreen.js
// Pantalla de Detalle de Producto
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import { addItemToCart } from '../../store/slices/cartSlice';

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
      dispatch(addItemToCart(product)); 
      Alert.alert("¡Éxito!", `${product.name} ha sido añadido a tu carrito.`);
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={stylesDetail.goBackButton}>
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
        <Text style={stylesDetail.productStock}>Stock disponible: {product.stock || 'Consultar'}</Text>
        
        <Text style={stylesDetail.descriptionHeader}>Descripción:</Text>
        <Text style={stylesDetail.productDescription}>
          {product.description || 'No hay descripción disponible para este producto.'}
        </Text>
        <TouchableOpacity style={stylesDetail.addToCartButton} onPress={handleAddToCart}>
          <Ionicons name="cart-outline" size={22} color={COLORS.white} />
          <Text style={stylesDetail.addToCartButtonText}>Añadir al Carrito</Text>
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
  },
  goBackButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  goBackButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  productImage: {
    width: '100%',
    height: 320,
    resizeMode: 'cover',
  },
  detailsContainer: {
    padding: 20,
  },
  productName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  productCategory: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productStock: {
    fontSize: 15,
    color: COLORS.success, 
    marginBottom: 20,
    fontWeight: '500',
  },
  descriptionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    marginTop:10,
  },
  productDescription: {
    fontSize: 16,
    color: COLORS.textMuted,
    lineHeight: 24,
    marginBottom: 30,
    textAlign: 'justify',
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
  },
});

export default ProductDetailScreen;