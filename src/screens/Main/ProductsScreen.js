// src/screens/Main/ProductsScreen.js
// Pantalla de Listado de Productos
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useLayoutEffect } from 'react';
import { ActivityIndicator, Button, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { clearProducts, fetchProducts } from '../../store/slices/productSlice';

const ProductListItem = ({ product, onPress }) => (
  <TouchableOpacity style={productStyles.productItemContainer} onPress={onPress}>
    <Image 
        source={{ uri: product.imageUrl || `https://placehold.co/120x120/${COLORS.lightGray.substring(1)}/AAAAAA&text=Producto` }} 
        style={productStyles.productItemImage} 
    />
    <View style={productStyles.productItemInfo}>
      <Text style={productStyles.productItemName} numberOfLines={2}>{product.name}</Text>
      <Text style={productStyles.productItemCategory}>Categoría: {product.categoryName || 'General'}</Text> 
      <Text style={productStyles.productItemPrice}>S/ {product.price.toFixed(2)}</Text>
    </View>
    <Ionicons name="chevron-forward-outline" size={24} color={COLORS.gray} />
  </TouchableOpacity>
);


const ProductsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { products, isLoading, error } = useSelector(state => state.products);
  const allCategories = useSelector(state => state.categories.categories); 

  const categoryId = route.params?.categoryId;
  const categoryName = route.params?.categoryName;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: categoryName ? `Productos en ${categoryName}` : 'Todos los Productos',
    });
  }, [navigation, categoryName]);

  useEffect(() => {
    dispatch(clearProducts()); 
    dispatch(fetchProducts({ categoryId }));
    
    return () => {
        dispatch(clearProducts());
    };
  }, [dispatch, categoryId]);

  const productsWithCategoryNames = products.map(prod => {
    const category = allCategories.find(cat => cat.id === prod.category);
    return {
      ...prod,
      categoryName: category ? category.name : 'Desconocida'
    };
  });


  if (isLoading && productsWithCategoryNames.length === 0) { 
    return (
      <View style={productStyles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{marginTop: 10, color: COLORS.textMuted}}>Cargando productos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={productStyles.centered}>
        <Ionicons name="cloud-offline-outline" size={60} color={COLORS.danger} />
        <Text style={productStyles.errorText}>Error al cargar productos: {error}</Text>
        <Button title="Intentar de Nuevo" onPress={() => dispatch(fetchProducts({ categoryId }))} color={COLORS.primary} />
      </View>
    );
  }

  if (!isLoading && productsWithCategoryNames.length === 0) {
    return (
      <View style={productStyles.centered}>
        <Ionicons name="search-outline" size={60} color={COLORS.gray} />
        <Text style={productStyles.emptyText}>No se encontraron productos</Text>
        {categoryName && <Text style={productStyles.emptySubText}>en la categoría "{categoryName}"</Text>}
      </View>
    );
  }


  const renderProduct = ({ item }) => (
    <ProductListItem
      product={item}
      onPress={() => navigation.navigate(ROUTES.PRODUCT_DETAIL, { productId: item.id, product: item })}
    />
  );

  return (
    <View style={productStyles.container}>
       <FlatList
        data={productsWithCategoryNames}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()} 
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};


const productStyles = StyleSheet.create({ 
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  productItemContainer: {
    backgroundColor: COLORS.white,
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  productItemImage: { 
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: COLORS.lightGray, 
  },
  productItemInfo: {
    flex: 1,
  },
  productItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  productItemCategory: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  productItemPrice: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  errorText: {
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 16,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 15,
    color: COLORS.gray,
    marginTop: 5,
  }
});

export default ProductsScreen;