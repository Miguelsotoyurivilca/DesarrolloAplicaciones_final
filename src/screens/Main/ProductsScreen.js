// src/screens/Main/ProductsScreen.js
// Pantalla de Listado de Productos
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Platform, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // Agregado Platform
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { clearProducts, fetchProducts } from '../../store/slices/productSlice';

const ProductListItem = React.memo(({ product, onPress }) => ( 
  <TouchableOpacity style={productStyles.productItemContainer} onPress={onPress} activeOpacity={0.8}>
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
));


const ProductsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { products, isLoading, error } = useSelector(state => state.products);
  const allCategories = useSelector(state => state.categories.categories); 
  const [refreshing, setRefreshing] = useState(false);

  const categoryId = route.params?.categoryId;
  const categoryName = route.params?.categoryName;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: categoryName ? `${categoryName}` : 'Catálogo', 
    });
  }, [navigation, categoryName]);

  const loadProducts = useCallback(() => {
    dispatch(clearProducts()); 
    dispatch(fetchProducts({ categoryId }));
  }, [dispatch, categoryId]);

  useEffect(() => {
    loadProducts();
    return () => {
        dispatch(clearProducts());
    };
  }, [loadProducts]); 

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProducts();
    setTimeout(() => setRefreshing(false), 1000); 
  }, [loadProducts]);

  const productsWithCategoryNames = products.map(prod => {
    const category = allCategories.find(cat => cat.id === prod.category);
    return {
      ...prod,
      categoryName: category ? category.name : 'Desconocida'
    };
  });


  if (isLoading && productsWithCategoryNames.length === 0 && !refreshing) { 
    return (
      <View style={productStyles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={productStyles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  if (error && !isLoading) { 
    return (
      <View style={productStyles.centered}>
        <Ionicons name="cloud-offline-outline" size={60} color={COLORS.danger} />
        <Text style={productStyles.errorText}>Error al cargar productos: {error}</Text>
        <TouchableOpacity style={productStyles.retryButton} onPress={loadProducts}>
            <Text style={productStyles.retryButtonText}>Intentar de Nuevo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isLoading && productsWithCategoryNames.length === 0 && !refreshing) {
    return (
      <View style={productStyles.centered}>
        <Ionicons name="search-circle-outline" size={70} color={COLORS.gray} />
        <Text style={productStyles.emptyText}>No se encontraron productos</Text>
        {categoryName && <Text style={productStyles.emptySubText}>en la categoría "{categoryName}"</Text>}
         <TouchableOpacity style={productStyles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={productStyles.retryButtonText}>Volver a Categorías</Text>
        </TouchableOpacity>
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
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }} 
        refreshControl={ 
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary}/>
        }
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
  loadingText: {
    marginTop: 10, 
    color: COLORS.textMuted, 
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
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
    fontWeight: '600', 
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  productItemCategory: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  productItemPrice: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-bold',
  },
  errorText: {
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  emptySubText: {
    fontSize: 15,
    color: COLORS.gray,
    marginTop: 5,
    marginBottom: 20,
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
  }
});

export default ProductsScreen;