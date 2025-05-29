// src/screens/Main/ProfileScreen.js
// Pantalla de Perfil de Usuario
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { storage } from '../../services/firebase';
import { logoutUser, updateUserProfilePhoto } from '../../store/slices/authSlice';

console.log('[ProfileScreen - Módulo] logoutUser importado:', typeof logoutUser, logoutUser);


const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user); 
  const isLoadingAuth = useSelector(state => state.auth.isLoading);
  const authError = useSelector(state => state.auth.error); 
  const [profileImageUri, setProfileImageUri] = useState(user?.photoURL || null);
  const [isUploading, setIsUploading] = useState(false);

  console.log('[ProfileScreen - Componente] logoutUser al inicio del componente:', typeof logoutUser, logoutUser);


  useEffect(() => {
    setProfileImageUri(user?.photoURL || null);
  }, [user?.photoURL]);


  const requestPermissions = async () => {
    console.log("[ProfileScreen - requestPermissions] Solicitando permisos..."); 
    if (Platform.OS !== 'web') {
      console.log("[ProfileScreen - requestPermissions] Solicitando permisos de MediaLibrary...");
      const cameraRollStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("[ProfileScreen - requestPermissions] Estado de MediaLibrary:", cameraRollStatus); 

      console.log("[ProfileScreen - requestPermissions] Solicitando permisos de Cámara...");
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      console.log("[ProfileScreen - requestPermissions] Estado de Cámara:", cameraStatus); 

      if (cameraRollStatus.status !== 'granted' || cameraStatus.status !== 'granted') {
        console.log("[ProfileScreen - requestPermissions] Uno o ambos permisos fueron denegados.");
        Alert.alert('Permisos Requeridos', 'Necesitamos permisos para acceder a tu cámara y galería para cambiar la foto de perfil.');
        return false;
      }
    }
    console.log("[ProfileScreen - requestPermissions] Permisos concedidos o es web.");
    return true;
  };

  const handleImageUpload = async (uri) => {
    if (!user || !uri) return;
    setIsUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExtension = uri.split('.').pop();
      const fileName = `${user.uid}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, `profile_pictures/${user.uid}/${fileName}`);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      console.log("[ProfileScreen] Imagen subida, downloadURL:", downloadURL);
      console.log("[ProfileScreen] Despachando updateUserProfilePhoto...");
      
      const resultAction = await dispatch(updateUserProfilePhoto({ userId: user.uid, photoURL: downloadURL }));
      
      if (updateUserProfilePhoto.fulfilled.match(resultAction)) {
        setProfileImageUri(downloadURL); 
        Alert.alert("Éxito", "Foto de perfil actualizada.");
      } else {
        throw new Error(resultAction.payload || "No se pudo actualizar la foto en Firebase Auth.");
      }

    } catch (e) {
      console.error("Error subiendo imagen: ", e);
      Alert.alert("Error", "No se pudo actualizar la foto de perfil. Inténtalo de nuevo.");
    } finally {
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    console.log("[ProfileScreen] Función pickImage LLAMADA.");
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log("[ProfileScreen] Permisos no concedidos en pickImage.");
      return;
    }
    console.log("[ProfileScreen] Permisos concedidos.");

    if (Platform.OS === 'web') {
      console.log("[ProfileScreen] Es web, intentando lanzar ImageLibraryAsync directamente.");
      try {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          console.log("[ProfileScreen - Web] Imagen seleccionada de galería:", result.assets[0].uri);
          handleImageUpload(result.assets[0].uri);
        } else {
          console.log("[ProfileScreen - Web] Selección de galería cancelada o sin assets.");
        }
      } catch (webError) {
        console.error("[ProfileScreen - Web] Error con launchImageLibraryAsync:", webError);
        Alert.alert("Error", "No se pudo abrir la galería de imágenes.");
      }
    } else {
      console.log("[ProfileScreen - Móvil] Mostrando alerta de selección de imagen...");
      Alert.alert(
        "Seleccionar Foto de Perfil",
        "Elige una opción:",
        [
          {
            text: "Tomar Foto",
            onPress: async () => {
              console.log("[ProfileScreen - Móvil] Opción 'Tomar Foto' seleccionada.");
              try {
                let result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.7,
                });
                if (!result.canceled && result.assets && result.assets.length > 0) {
                  console.log("[ProfileScreen - Móvil] Foto tomada:", result.assets[0].uri);
                  handleImageUpload(result.assets[0].uri);
                } else {
                   console.log("[ProfileScreen - Móvil] Cámara cancelada o sin assets.");
                }
              } catch (cameraError) {
                console.error("[ProfileScreen - Móvil] Error con launchCameraAsync:", cameraError);
                Alert.alert("Error", "No se pudo acceder a la cámara.");
              }
            }
          },
          {
            text: "Elegir de Galería",
            onPress: async () => {
              console.log("[ProfileScreen - Móvil] Opción 'Elegir de Galería' seleccionada.");
              try {
                let result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.7,
                });
                if (!result.canceled && result.assets && result.assets.length > 0) {
                  console.log("[ProfileScreen - Móvil] Imagen seleccionada de galería:", result.assets[0].uri);
                  handleImageUpload(result.assets[0].uri);
                } else {
                  console.log("[ProfileScreen - Móvil] Galería cancelada o sin assets.");
                }
              } catch (libraryError) {
                 console.error("[ProfileScreen - Móvil] Error con launchImageLibraryAsync:", libraryError);
                 Alert.alert("Error", "No se pudo acceder a la galería.");
              }
            }
          },
          { text: "Cancelar", style: "cancel", onPress: () => console.log("[ProfileScreen - Móvil] Selección cancelada.") }
        ]
      );
    }
  };
  
  const performLogout = useCallback(async () => {
    console.log("[ProfileScreen - performLogout] Intentando despachar logoutUser...");
    console.log("[ProfileScreen - performLogout] typeof logoutUser:", typeof logoutUser, logoutUser); 
    if (typeof logoutUser !== 'function') {
        console.error("[ProfileScreen - performLogout] logoutUser NO ES UNA FUNCIÓN!");
        Alert.alert("Error Interno", "La función de logout no está disponible.");
        return;
    }
    try {
      const resultAction = await dispatch(logoutUser()); 
      console.log("[ProfileScreen] Resultado de logoutUser:", resultAction);
      if (logoutUser.fulfilled.match(resultAction)) {
        console.log("[ProfileScreen] Cierre de sesión completado (fulfilled).");
      } else if (logoutUser.rejected.match(resultAction)) {
        console.error("[ProfileScreen] Falla al cerrar sesión (rejected):", resultAction.payload);
        const errorMessage = "No se pudo cerrar la sesión: " + (resultAction.payload || "Error desconocido");
        if (Platform.OS === 'web') {
            alert(errorMessage);
        } else {
            Alert.alert("Error", errorMessage);
        }
      }
    } catch (e) {
      console.error("[ProfileScreen] Excepción en performLogout:", e);
      const errorMessage = "Ocurrió una excepción al intentar cerrar sesión.";
      if (Platform.OS === 'web') {
        alert(errorMessage);
      } else {
        Alert.alert("Error", errorMessage);
      }
    }
  }, [dispatch]); 


  const handleLogout = async () => { 
    try {
      console.log("[ProfileScreen] Inicio de handleLogout");
      console.log("[ProfileScreen] Estado actual de isLoading (auth):", isLoadingAuth);
      console.log("[ProfileScreen] Estado actual de authError:", authError);
      console.log("[ProfileScreen] A punto de llamar a la confirmación");

      if (Platform.OS === 'web') {
        console.log("[ProfileScreen] Usando window.confirm para web.");
        if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) {
          await performLogout(); 
        } else {
          console.log("[ProfileScreen] Cierre de sesión cancelado por el usuario (web confirm).");
        }
      } else {
        console.log("[ProfileScreen] Usando Alert.alert para móvil.");
        Alert.alert(
          "Cerrar Sesión",
          "¿Estás seguro de que quieres cerrar sesión?",
          [
            { text: "Cancelar", style: "cancel", onPress: () => console.log("[ProfileScreen] Cierre de sesión cancelado por el usuario (móvil alert).") },
            {
              text: "Sí, Cerrar Sesión",
              style: "destructive",
              onPress: performLogout 
            }
          ]
        );
      }
      console.log("[ProfileScreen] Confirmación llamada exitosamente.");

    } catch (error) {
      console.error("[ProfileScreen] Error DENTRO de handleLogout:", error);
      if (Platform.OS === 'web') {
        alert("Error Inesperado: " + error.message);
      } else {
        Alert.alert("Error Inesperado", "Ocurrió un error: " + error.message);
      }
    }
  };

  const imageSource = profileImageUri
    ? { uri: profileImageUri }
    : { uri: `https://placehold.co/120x120/${COLORS.white.substring(1)}/${COLORS.primary_dark.substring(1)}&text=${user?.email ? user.email[0].toUpperCase() : 'P'}`};


  return (
    <View style={profileStyles.container}>
      <View style={profileStyles.profileHeader}>
        <TouchableOpacity onPress={pickImage} disabled={isUploading} activeOpacity={0.7}>
          <Image 
            source={imageSource}
            style={profileStyles.profileImage}
          />
          {isUploading && (
            <View style={profileStyles.uploadingOverlay}>
              <ActivityIndicator color={COLORS.white} size="small" />
            </View>
          )}
          {!isUploading && (
            <View style={profileStyles.cameraIconOverlay}>
                <Ionicons name="camera-reverse-outline" size={20} color={COLORS.white} />
            </View>
          )}
        </TouchableOpacity>
        <Text style={profileStyles.userName}>{user?.displayName || user?.email || 'Usuario PetShop'}</Text>
        {user?.email && <Text style={profileStyles.userEmail}>{user.email}</Text>}
      </View>
      
      <TouchableOpacity style={profileStyles.menuItem} onPress={() => navigation.navigate(ROUTES.ORDERS)} activeOpacity={0.6}>
        <Ionicons name="receipt-outline" size={24} color={COLORS.primary} />
        <Text style={profileStyles.menuItemText}>Mis Pedidos</Text>
        <Ionicons name="chevron-forward-outline" size={22} color={COLORS.gray} />
      </TouchableOpacity>

       <TouchableOpacity 
            style={profileStyles.menuItem} 
            onPress={() => navigation.navigate(ROUTES.EDIT_PROFILE)} // <--- NAVEGAR A EDIT_PROFILE
            activeOpacity={0.6}
        >
        <Ionicons name="person-circle-outline" size={24} color={COLORS.primary} />
        <Text style={profileStyles.menuItemText}>Editar Perfil</Text>
        <Ionicons name="chevron-forward-outline" size={22} color={COLORS.gray} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={profileStyles.menuItem} 
        onPress={() => navigation.navigate(ROUTES.SETTINGS)} // <--- NAVEGAR A SETTINGS
        activeOpacity={0.6}
      >
        <Ionicons name="settings-outline" size={24} color={COLORS.primary} />
        <Text style={profileStyles.menuItemText}>Configuración</Text>
        <Ionicons name="chevron-forward-outline" size={22} color={COLORS.gray} />
      </TouchableOpacity>

      <View style={profileStyles.logoutButtonContainer}>
        <TouchableOpacity 
            style={[profileStyles.menuItem, profileStyles.logoutButton]} 
            onPress={handleLogout}
            disabled={isLoadingAuth || isUploading}
            activeOpacity={0.6}
        >
            <Ionicons name="log-out-outline" size={26} color={COLORS.danger} />
            {isLoadingAuth ? 
                <ActivityIndicator color={COLORS.danger} style={{marginLeft: 15}}/> :
                <Text style={[profileStyles.menuItemText, profileStyles.logoutButtonText]}>Cerrar Sesión</Text>
            }
        </TouchableOpacity>
      </View>
    </View>
  );
};

const profileStyles = StyleSheet.create({ 
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileHeader: {
    backgroundColor: COLORS.primary,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 25,
    borderBottomLeftRadius: 25, 
    borderBottomRightRadius: 25,
    elevation: 5, 
  },
  profileImage: {
    width: 110, 
    height: 110,
    borderRadius: 55, 
    marginBottom: 15,
    borderWidth: 3,
    borderColor: COLORS.white,
    backgroundColor: COLORS.lightGray, 
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 55,
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 12, 
    right: 2,  
    backgroundColor: COLORS.secondary,
    padding: 8, 
    borderRadius: 20, 
    borderWidth: 2, 
    borderColor: COLORS.white,
    elevation: 5,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  userEmail: {
    fontSize: 15,
    color: COLORS.primary_light,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  menuItem: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    borderRadius: 12, 
    marginBottom: 12, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, 
    shadowRadius: 3,
    elevation: 2, 
  },
  menuItemText: {
    flex: 1,
    marginLeft: 18,
    fontSize: 17,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  logoutButtonContainer: {
    marginTop: 20, 
  },
  logoutButton: {
  },
  logoutButtonText: {
    color: COLORS.danger,
    fontWeight: '600',
  }
});

export default ProfileScreen;