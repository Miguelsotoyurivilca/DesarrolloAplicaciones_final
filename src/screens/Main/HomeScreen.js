// src/screens/Main/HomeScreen.js
// Pantalla Principal
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // <--- IMPORTAR useFocusEffect
import React, { useCallback, useState } from 'react'; // useEffect se mantiene por si se usa para otras cosas, useState para refreshing
import { ActivityIndicator, Alert, FlatList, Image, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { fetchCategories } from '../../store/slices/categorySlice';
import { fetchProducts } from '../../store/slices/productSlice'; // Podríamos necesitar una acción para limpiar solo los destacados si la lógica se complica

const CategoryCard = React.memo(({ category, onPress }) => (
  <TouchableOpacity style={homeStyles.categoryCard} onPress={onPress} activeOpacity={0.7}>
    <Image source={{ uri: category.imageUrl || `https://placehold.co/100x80/${COLORS.primary_light.substring(1)}/FFFFFF?text=${category.name.substring(0,1)}` }} style={homeStyles.categoryImage} />
    <Text style={homeStyles.categoryName} numberOfLines={2}>{category.name}</Text>
  </TouchableOpacity>
));

const ProductHighlightCard = React.memo(({ product, onPress }) => (
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
  // Seleccionamos todos los productos del store, HomeScreen se encargará de mostrar solo los destacados
  const { products, isLoading: isLoadingProducts, error: errorProducts } = useSelector(state => state.products);
  const [refreshing, setRefreshing] = useState(false);

  // console.logs para depuración
  // console.log("[HomeScreen - Render] Categorías:", categories.length, "isLoading:", isLoadingCategories, "error:", errorCategories);
  // console.log("[HomeScreen - Render] Productos (para destacados):", products.length, "isLoading:", isLoadingProducts, "error:", errorProducts);

  const loadDataForHomeScreen = useCallback(() => {
    console.log("[HomeScreen] loadDataForHomeScreen disparado.");
    // Despachar la limpieza de productos de "destacados" antes de volver a cargar es opcional.
    // Si tu `fetchProducts({ limit: 6 })` siempre reemplaza el estado de `products` con solo 6, no es estrictamente necesario aquí.
    // Pero si `fetchProducts` acumulara o si quieres un estado más predecible para HomeScreen:
    // dispatch(clearProductHighlights()); // O una acción más específica si el slice de productos se vuelve más complejo.
    dispatch(fetchCategories());
    dispatch(fetchProducts({ limit: 6 })); // Cargar solo los productos destacados
  }, [dispatch]);

  // Usar useFocusEffect para cargar datos cuando la pantalla está en foco
  useFocusEffect(
    useCallback(() => {
      console.log("[HomeScreen] Pantalla en foco, llamando a loadDataForHomeScreen.");
      loadDataForHomeScreen();

      // Opcional: Función de limpieza si es necesario cuando la pantalla pierde el foco
      // return () => {
      //   console.log("[HomeScreen] Pantalla perdió el foco.");
      //   // dispatch(clearProductHighlights()); // Por ejemplo, limpiar solo los destacados
      // };
    }, [loadDataForHomeScreen])
  );

  const onRefresh = useCallback(() => {
    console.log("[HomeScreen] onRefresh disparado.");
    setRefreshing(true);
    // Usamos Promise.all para esperar que ambas cargas terminen antes de quitar el refreshing
    Promise.all([
      dispatch(fetchCategories()),
      dispatch(fetchProducts({ limit: 6 }))
    ]).finally(() => {
      setRefreshing(false);
      console.log("[HomeScreen] onRefresh completado.");
    });
  }, [dispatch]); // No necesitamos loadDataForHomeScreen como dependencia aquí, ya que onRefresh hace lo mismo.

  // Asegurarnos de que products sea un array antes de slice
  const featuredProducts = Array.isArray(products) ? products.slice(0, 6) : [];

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

  // Mostrar un solo loader si cualquiera de los datos esenciales está cargando y no hay datos aún
  if ((isLoadingCategories || isLoadingProducts) && !refreshing && categories.length === 0 && featuredProducts.length === 0) {
    return (
      <View style={homeStyles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={homeStyles.loadingText}>Cargando Inicio...</Text>
      </View>
    );
  }

  return (
    <ScrollView
        style={homeStyles.container}
        refreshControl={
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
        {isLoadingCategories && categories.length === 0 && !refreshing && <ActivityIndicator color={COLORS.primary} style={{marginVertical: 20}}/>}
        {errorCategories && <Text style={homeStyles.errorText}>Error al cargar categorías: {errorCategories}</Text>}
        {!isLoadingCategories && categories.length === 0 && !errorCategories && <Text style={homeStyles.emptySectionText}>No hay categorías disponibles.</Text>}
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={item => item.id.toString()} // Asegurar que sea string
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={homeStyles.horizontalList}
        />
      </View>

      <View style={homeStyles.section}>
        <Text style={homeStyles.sectionTitle}>Productos Destacados</Text>
        {isLoadingProducts && featuredProducts.length === 0 && !refreshing && <ActivityIndicator color={COLORS.primary} style={{marginVertical: 20}}/>}
        {errorProducts && <Text style={homeStyles.errorText}>Error al cargar productos: {errorProducts}</Text>}
        {!isLoadingProducts && featuredProducts.length === 0 && !errorProducts && <Text style={homeStyles.emptySectionText}>No hay productos destacados.</Text>}
        <FlatList
          data={featuredProducts}
          renderItem={renderProductHighlight}
          keyExtractor={item => item.id.toString()} // Asegurar que sea string
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
  loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: COLORS.textMuted,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  promoBanner: {
    height: 160,
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
  sectionLast: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    fontWeight: '700',
    color: COLORS.primary_dark,
    marginLeft: 15,
    marginBottom: 15,
  },
  horizontalList: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  categoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginRight: 12,
    width: 110,
    height: 120,
    justifyContent: 'space-around',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  categoryImage: {
    width: 60,
    height: 55,
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
    width: 170,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 130,
    resizeMode: 'cover',
  },
  productInfoContainer: {
    padding: 10,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 5,
    height: 40,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginHorizontal: 15,
    backgroundColor: COLORS.primary_light,
    borderRadius: 10,
  },
  viewAllButtonText: {
    color: COLORS.primary_dark,
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
  },
  emptySectionText: { // Nuevo estilo para secciones vacías
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 15,
    marginVertical: 15,
    paddingHorizontal: 15,
  }
});
export default HomeScreen;