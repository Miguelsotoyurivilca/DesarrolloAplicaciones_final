// src/store/slices/authSlice.js
// Slice de Redux para manejar el estado de autenticación.
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth as firebaseAuth } from '../../services/firebase';


const initialState = {
  user: null, 
  isAuthenticated: false, 
  isLoading: true, 
  error: null,
};

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      return { uid: userCredential.user.uid, email: userCredential.user.email, photoURL: userCredential.user.photoURL, displayName: userCredential.user.displayName }; 
    } catch (error) {
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo electrónico ya está registrado.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El formato del correo electrónico no es válido.';
      }
      return rejectWithValue(errorMessage); 
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      return { uid: userCredential.user.uid, email: userCredential.user.email, photoURL: userCredential.user.photoURL, displayName: userCredential.user.displayName }; 
    } catch (error) {
      let errorMessage = error.message;
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Correo o contraseña incorrectos. Por favor, verifica tus credenciales.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El formato del correo electrónico no es válido.';
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    console.log("[authSlice/logoutUser] Iniciando proceso de signOut de Firebase...");
    try {
      await signOut(firebaseAuth);
      console.log("[authSlice/logoutUser] signOut de Firebase exitoso.");
      return null; 
    } catch (error) {
      console.error("[authSlice/logoutUser] Error en signOut de Firebase:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserProfilePhoto = createAsyncThunk(
  'auth/updateUserProfilePhoto',
  async ({ userId, photoURL }, { dispatch, rejectWithValue, getState }) => { 
    console.log("[authSlice] Iniciando updateUserProfilePhoto. Nueva URL:", photoURL); 
    try {
      if (!firebaseAuth.currentUser || firebaseAuth.currentUser.uid !== userId) {
        console.error("[authSlice] Error: Usuario no autenticado o ID no coincide.");
        return rejectWithValue('Usuario no autenticado o ID no coincide.');
      }
      await updateProfile(firebaseAuth.currentUser, { photoURL });
      console.log("[authSlice] Perfil de Firebase Auth actualizado con nueva photoURL."); 
      
      const currentUserState = getState().auth.user;
      // Crear un nuevo objeto de usuario para evitar mutar el estado directamente
      const updatedUser = { ...currentUserState, uid: userId, photoURL };
      dispatch(setUser(updatedUser)); 
      console.log("[authSlice] Estado de Redux actualizado con nueva photoURL."); 
      return photoURL;
    } catch (error) {
      console.error("[authSlice] Error actualizando foto de perfil en Firebase Auth:", error);
      return rejectWithValue(error.message);
    }
  }
);

// NUEVO THUNK para actualizar displayName
export const updateUserDisplayName = createAsyncThunk(
  'auth/updateUserDisplayName',
  async ({ userId, displayName }, { dispatch, rejectWithValue, getState }) => {
    console.log(`[authSlice] Actualizando displayName para ${userId} a: ${displayName}`);
    try {
      if (!firebaseAuth.currentUser || firebaseAuth.currentUser.uid !== userId) {
        return rejectWithValue('Usuario no autenticado o ID no coincide para actualizar displayName.');
      }
      await updateProfile(firebaseAuth.currentUser, { displayName });
      console.log("[authSlice] Perfil de Firebase Auth actualizado con nuevo displayName.");

      const currentUserState = getState().auth.user;
      const updatedUser = { ...currentUserState, uid: userId, displayName };
      dispatch(setUser(updatedUser));
      console.log("[authSlice] Estado de Redux actualizado con nuevo displayName.");
      return displayName;
    } catch (error) {
      console.error("[authSlice] Error actualizando displayName en Firebase Auth:", error);
      return rejectWithValue(error.message);
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload; 
      state.isAuthenticated = !!action.payload; 
      state.isLoading = false; 
      if (action.payload && state.error) { // Limpiar error solo si hay un usuario y había un error
          state.error = null; 
      } else if (!action.payload) { // Si el payload es null (logout), limpiar error
          state.error = null;
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
      if(action.payload) state.error = null; 
    },
    setError: (state, action) => { 
      state.error = action.payload;
      state.isLoading = false; 
    }
  },
  extraReducers: (builder) => {
    builder
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // setUser será llamado por onAuthStateChanged
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload; 
      })
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // setUser será llamado por onAuthStateChanged
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Logout User
      .addCase(logoutUser.pending, (state) => {
        console.log("[authSlice/logoutUser.pending] Estado de carga activado para logout.");
        state.isLoading = true; 
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        console.log("[authSlice/logoutUser.fulfilled] Logout completado.");
        // isLoading se pondrá en false y user en null por onAuthStateChanged -> setUser(null)
        // No es necesario modificar state.user o state.isAuthenticated aquí directamente
      })
      .addCase(logoutUser.rejected, (state, action) => {
        console.error("[authSlice/logoutUser.rejected] Error en logout:", action.payload);
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Profile Photo
      .addCase(updateUserProfilePhoto.pending, (state) => { 
        state.isLoading = true; 
        state.error = null;
      })
      .addCase(updateUserProfilePhoto.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) { // Reducer setUser ya actualiza el estado global del usuario
          // state.user.photoURL = action.payload; // Esto ya lo hace setUser
        }
      })
      .addCase(updateUserProfilePhoto.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload; 
        console.error("Fallo al actualizar foto de perfil en slice:", action.payload);
      })
      // Update Display Name
      .addCase(updateUserDisplayName.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserDisplayName.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) { // Reducer setUser ya actualiza el estado global del usuario
          // state.user.displayName = action.payload; // Esto ya lo hace setUser
        }
      })
      .addCase(updateUserDisplayName.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.error("Fallo al actualizar displayName en slice:", action.payload);
      });
  }
});

export const { setUser, setLoading, setError } = authSlice.actions;

export default authSlice.reducer;