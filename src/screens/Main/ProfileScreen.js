// src/screens/Main/ProfileScreen.js
// Pantalla de Perfil de Usuario
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { storage } from '../../services/firebase'; // Importar storage y firebaseAuth
import { logoutUser, updateUserProfilePhoto } from '../../store/slices/authSlice'; // Importar updateUserProfilePhoto
// import { updateProfile } from 'firebase/auth'; // Ya está en authSlice


const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user); 
  const isLoadingLogout = useSelector(state => state.auth.isLoading); 
  const [profileImageUri, setProfileImageUri] = useState(user?.photoURL || null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setProfileImageUri(user?.photoURL || null);
  }, [user?.photoURL]);


  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const cameraRollStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraRollStatus.status !== 'granted' || cameraStatus.status !== 'granted') {
        Alert.alert('Permisos Requeridos', 'Necesitamos permisos para acceder a tu cámara y galería para cambiar la foto de perfil.');
        return false;
      }
    }
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
      // Crear referencia en Firebase Storage en la carpeta 'profile_pictures/userId/fileName'
      const storageRef = ref(storage, `profile_pictures/${user.uid}/${fileName}`);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Despachar la acción para actualizar en Firebase Auth y Redux
      const resultAction = await dispatch(updateUserProfilePhoto({ userId: user.uid, photoURL: downloadURL }));
      
      if (updateUserProfilePhoto.fulfilled.match(resultAction)) {
        setProfileImageUri(downloadURL); // Actualizar estado local de la imagen
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
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert(
      "Seleccionar Foto de Perfil",
      "Elige una opción:",
      [
        {
          text: "Tomar Foto",
          onPress: async () => {
            let result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1], 
              quality: 0.7,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              // setProfileImageUri(result.assets[0].uri); // Actualización visual inmediata (opcional)
              handleImageUpload(result.assets[0].uri);
            }
          }
        },
        {
          text: "Elegir de Galería",
          onPress: async () => {
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              // setProfileImageUri(result.assets[0].uri); // Actualización visual inmediata (opcional)
              handleImageUpload(result.assets[0].uri);
            }
          }
        },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };


  const handleLogout = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sí, Cerrar Sesión", 
          style: "destructive",
          onPress: async () => {
            await dispatch(logoutUser());
          }
        }
      ]
    );
  };

  const imageSource = profileImageUri 
    ? { uri: profileImageUri } 
    : { uri: `https://placehold.co/120x120/${COLORS.white.substring(1)}/${COLORS.primary_dark.substring(1)}&text=${user?.email ? user.email[0].toUpperCase() : 'P'}`};


  return (
    <View style={profileStyles.container}>
      <View style={profileStyles.profileHeader}>
        <TouchableOpacity onPress={pickImage} disabled={isUploading}>
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
                <Ionicons name="camera" size={20} color={COLORS.white} />
            </View>
          )}
        </TouchableOpacity>
        <Text style={profileStyles.userName}>{user?.displayName || user?.email || 'Usuario PetShop'}</Text>
        {user?.email && <Text style={profileStyles.userEmail}>{user.email}</Text>}
      </View>
      
      <TouchableOpacity style={profileStyles.menuItem} onPress={() => navigation.navigate(ROUTES.ORDERS)}>
        <Ionicons name="receipt-outline" size={24} color={COLORS.primary} />
        <Text style={profileStyles.menuItemText}>Mis Pedidos</Text>
        <Ionicons name="chevron-forward-outline" size={22} color={COLORS.gray} />
      </TouchableOpacity>

       <TouchableOpacity style={profileStyles.menuItem} onPress={() => Alert.alert('Editar Perfil', 'Funcionalidad no implementada aún.')}>
        <Ionicons name="person-circle-outline" size={24} color={COLORS.primary} />
        <Text style={profileStyles.menuItemText}>Editar Perfil</Text>
        <Ionicons name="chevron-forward-outline" size={22} color={COLORS.gray} />
      </TouchableOpacity>

      <TouchableOpacity style={profileStyles.menuItem} onPress={() => Alert.alert('Configuración', 'Funcionalidad no implementada aún.')}>
        <Ionicons name="settings-outline" size={24} color={COLORS.primary} />
        <Text style={profileStyles.menuItemText}>Configuración</Text>
        <Ionicons name="chevron-forward-outline" size={22} color={COLORS.gray} />
      </TouchableOpacity>

      <View style={profileStyles.logoutButtonContainer}>
        <TouchableOpacity 
            style={[profileStyles.menuItem, profileStyles.logoutButton]} 
            onPress={handleLogout}
            disabled={isLoadingLogout || isUploading}
        >
            <Ionicons name="log-out-outline" size={26} color={COLORS.danger} />
            {isLoadingLogout ? 
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
    bottom: 10,
    right: 0,
    backgroundColor: COLORS.secondary,
    padding: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 15,
    color: COLORS.primary_light,
  },
  menuItem: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemText: {
    flex: 1,
    marginLeft: 18,
    fontSize: 17,
    color: COLORS.text,
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