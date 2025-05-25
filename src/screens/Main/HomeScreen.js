// src/screens/Main/HomeScreen.js
// Pantalla Principal
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { fetchCategories } from '../../store/slices/categorySlice';
import { fetchProducts } from '../../store/slices/productSlice';

const CategoryCard = ({ category, onPress }) => (
  <TouchableOpacity style={homeStyles.categoryCard} onPress={onPress}>
    <Image source={{ uri: category.imageUrl || `https://placehold.co/100x80/${COLORS.primary_light.substring(1)}/FFFFFF?text=${category.name.substring(0,1)}` }} style={homeStyles.categoryImage} />
    <Text style={homeStyles.categoryName}>{category.name}</Text>
  </TouchableOpacity>
);

const ProductHighlightCard = ({ product, onPress }) => (
  <TouchableOpacity style={homeStyles.productCard} onPress={onPress}>
    <Image source={{ uri: product.imageUrl || `https://placehold.co/150x120/${COLORS.lightGray.substring(1)}/000000?text=Producto`}} style={homeStyles.productImage} />
    <Text style={homeStyles.productName} numberOfLines={2}>{product.name}</Text>
    <Text style={homeStyles.productPrice}>S/ {product.price.toFixed(2)}</Text>
  </TouchableOpacity>
);


const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { categories, isLoading: isLoadingCategories, error: errorCategories } = useSelector(state => state.categories);
  const { products, isLoading: isLoadingProducts, error: errorProducts } = useSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts({ limit: 6 })); 
  }, [dispatch]);

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


  if (isLoadingCategories || isLoadingProducts) {
    return (
      <View style={homeStyles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={homeStyles.container}>
      <TouchableOpacity style={homeStyles.promoBanner} onPress={() => Alert.alert("Promo!", "¡Descuentos especiales esta semana!")}>
        <Image 
            source={{uri: `https://placehold.co/400x150/${COLORS.secondary.substring(1)}/FFFFFF?text=¡Ofertas+Increíbles!`}} 
            style={homeStyles.promoBannerImage}
        />
      </TouchableOpacity>

      <View style={homeStyles.section}>
        <Text style={homeStyles.sectionTitle}>Categorías Populares</Text>
        {errorCategories && <Text style={homeStyles.errorText}>Error al cargar categorías: {errorCategories}</Text>}
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
        {errorProducts && <Text style={homeStyles.errorText}>Error al cargar productos: {errorProducts}</Text>}
        <FlatList
          data={featuredProducts}
          renderItem={renderProductHighlight}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={homeStyles.horizontalList}
        />
      </View>
      
      <View style={homeStyles.section}>
        <TouchableOpacity 
            style={homeStyles.viewAllButton} 
            onPress={() => navigation.navigate(ROUTES.PRODUCTS_TAB, { screen: ROUTES.PRODUCTS })}
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
    height: 150,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary_dark,
    marginLeft: 15,
    marginBottom: 12,
  },
  horizontalList: {
    paddingHorizontal: 15,
  },
  categoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginRight: 12,
    width: 110,
    height: 110, 
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryImage: {
    width: 60,
    height: 50,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginRight: 15,
    width: 160, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
    paddingBottom: 10,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: 8,
    marginBottom: 4,
    height: 35, 
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
    paddingHorizontal: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 15,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary_light,
  },
  viewAllButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  errorText: {
    color: COLORS.danger,
    textAlign: 'center',
    marginVertical: 10,
  }
});

export default HomeScreen;