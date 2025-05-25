// src/screens/Main/HomeScreen.js
// Pantalla Principal
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react'; // Añadido useCallback
import { ActivityIndicator, Alert, FlatList, Image, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { fetchCategories } from '../../store/slices/categorySlice';
import { fetchProducts } from '../../store/slices/productSlice';

const CategoryCard = React.memo(({ category, onPress }) => ( // React.memo para optimizar
  <TouchableOpacity style={homeStyles.categoryCard} onPress={onPress} activeOpacity={0.7}>
    <Image source={{ uri: category.imageUrl || `https://placehold.co/100x80/${COLORS.primary_light.substring(1)}/FFFFFF?text=${category.name.substring(0,1)}` }} style={homeStyles.categoryImage} />
    <Text style={homeStyles.categoryName} numberOfLines={2}>{category.name}</Text>
  </TouchableOpacity>
));

const ProductHighlightCard = React.memo(({ product, onPress }) => ( // React.memo para optimizar
  <TouchableOpacity style={homeStyles.productCard} onPress={onPress} activeOpacity={0.8}>
    <Image source={{ uri: product.imageUrl || `https://placehold.co/150x120/${COLORS.lightGray.substring(1)}/000000?text=Producto`}} style={homeStyles.productImage} />
    <View style={homeStyles.productInfoContainer}>
        <Text style={homeStyles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={homeStyles.productPrice}>S/ {product.price.toFixed(2)}</Text>
    </View>
  </TouchableOpacity>
));


const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { categories, isLoading: isLoadingCategories, error: errorCategories } = useSelector(state => state.categories);
  const { products, isLoading: isLoadingProducts, error: errorProducts } = useSelector(state => state.products);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts({ limit: 6 })); 
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
    setRefreshing(false); // Idealmente, esto se haría después de que los datos carguen
  }, [loadData]);

  const featuredProducts = products.slice(0, 6); 

  const renderCategory = ({ item }) => (
    <CategoryCard 
        category={item} 
        onPress={() => navigation.navigate(ROUTES.PRODUCTS_BY_CATEGORY, { categoryId: item.id, categoryName: item.name })} 
    />
  );

  const renderProductHighlight = ({ item }) => (
    <ProductHighlightCard 
        product={item}
        onPress={() => navigation.navigate(ROUTES.PRODUCT_DETAIL, { productId: item.id, product: item })}
    />
  );


  if ((isLoadingCategories || isLoadingProducts) && !refreshing && categories.length === 0 && products.length === 0) {
    return (
      <View style={homeStyles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
        style={homeStyles.container}
        refreshControl={ // Añadir pull-to-refresh
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary}/>
        }
    >
      <TouchableOpacity style={homeStyles.promoBanner} onPress={() => Alert.alert("Promo!", "¡Descuentos especiales esta semana!")} activeOpacity={0.9}>
        <Image 
            source={{uri: `https://placehold.co/400x150/${COLORS.secondary.substring(1)}/FFFFFF?text=¡Ofertas+Increíbles!`}} 
            style={homeStyles.promoBannerImage}
        />
      </TouchableOpacity>

      <View style={homeStyles.section}>
        <Text style={homeStyles.sectionTitle}>Categorías Populares</Text>
        {errorCategories && !isLoadingCategories && <Text style={homeStyles.errorText}>Error al cargar categorías: {errorCategories}</Text>}
        {isLoadingCategories && categories.length === 0 && <ActivityIndicator color={COLORS.primary} style={{marginVertical: 20}}/>}
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={homeStyles.horizontalList}
        />
      </View>

      <View style={homeStyles.section}>
        <Text style={homeStyles.sectionTitle}>Productos Destacados</Text>
        {errorProducts && !isLoadingProducts && <Text style={homeStyles.errorText}>Error al cargar productos: {errorProducts}</Text>}
        {isLoadingProducts && featuredProducts.length === 0 && <ActivityIndicator color={COLORS.primary} style={{marginVertical: 20}}/>}
        <FlatList
          data={featuredProducts}
          renderItem={renderProductHighlight}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={homeStyles.horizontalList}
        />
      </View>
      
      <View style={homeStyles.sectionLast}>
        <TouchableOpacity 
            style={homeStyles.viewAllButton} 
            onPress={() => navigation.navigate(ROUTES.PRODUCTS_TAB, { screen: ROUTES.PRODUCTS })}
            activeOpacity={0.7}
        >
            <Text style={homeStyles.viewAllButtonText}>Ver Todos los Productos</Text>
            <Ionicons name="arrow-forward-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

const homeStyles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  promoBanner: {
    height: 160, // Un poco más alto
    backgroundColor: COLORS.secondary_light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  promoBannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  section: {
    marginBottom: 25,
  },
  sectionLast: { // Menos margen inferior para la última sección
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    fontWeight: '700',
    color: COLORS.primary_dark,
    marginLeft: 15,
    marginBottom: 15, // Más espacio
  },
  horizontalList: {
    paddingHorizontal: 15,
    paddingVertical: 5, // Pequeño padding vertical
  },
  categoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12, // Más redondeado
    padding: 12,
    alignItems: 'center',
    marginRight: 12,
    width: 110,
    height: 120, // Ligeramente más alto
    justifyContent: 'space-around', // Mejor distribución interna
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, // Sombra más sutil
    shadowRadius: 4,
    elevation: 3, // Sutil elevación
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  categoryImage: {
    width: 60,
    height: 55, // Ajustado
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginRight: 15,
    width: 170, // Un poco más ancho
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    overflow: 'hidden', // Para que la imagen no se salga de los bordes redondeados
  },
  productImage: {
    width: '100%',
    height: 130, // Más alto
    resizeMode: 'cover',
  },
  productInfoContainer: { // Contenedor para el texto del producto
    padding: 10,
  },
  productName: {
    fontSize: 15, // Ligeramente más grande
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 5,
    height: 40, 
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  productPrice: {
    fontSize: 16, // Ligeramente más grande
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14, // Más padding
    marginHorizontal: 15,
    backgroundColor: COLORS.primary_light, // Color de fondo diferente
    borderRadius: 10,
    // borderWidth: 1, // Quitar borde si tiene fondo
    // borderColor: COLORS.primary_light,
  },
  viewAllButtonText: {
    color: COLORS.primary_dark, // Texto más oscuro para contraste
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  errorText: {
    color: COLORS.danger,
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  }
});

export default HomeScreen;
