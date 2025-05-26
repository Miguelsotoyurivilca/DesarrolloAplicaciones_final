// src/store/slices/authSlice.js
// Slice de Redux para manejar el estado de autenticación.
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile // Importar updateProfile para actualizar photoURL en Firebase Auth
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
      return { uid: userCredential.user.uid, email: userCredential.user.email, photoURL: userCredential.user.photoURL }; 
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
      return { uid: userCredential.user.uid, email: userCredential.user.email, photoURL: userCredential.user.photoURL }; 
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
      // onAuthStateChanged manejará la actualización del estado a null.
      return null; // Indica éxito
    } catch (error) {
      console.error("[authSlice/logoutUser] Error en signOut de Firebase:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Thunk para actualizar la foto de perfil en Firebase Auth
export const updateUserProfilePhoto = createAsyncThunk(
  'auth/updateUserProfilePhoto',
  async ({ userId, photoURL }, { dispatch, rejectWithValue, getState }) => { // Añadir getState
    try {
      if (!firebaseAuth.currentUser || firebaseAuth.currentUser.uid !== userId) {
        return rejectWithValue('Usuario no autenticado o ID no coincide.');
      }
      await updateProfile(firebaseAuth.currentUser, { photoURL });
      
      // Obtener el estado actual del usuario para no perder otra información como displayName
      const currentUserState = getState().auth.user;
      dispatch(setUser({ ...currentUserState, uid: userId, photoURL })); // Actualizar Redux con la nueva photoURL
      return photoURL;
    } catch (error) {
      console.error("Error actualizando foto de perfil en Firebase Auth:", error);
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
      if (action.payload) { 
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
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload; 
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.pending, (state) => {
        console.log("[authSlice/logoutUser.pending] Estado de carga activado para logout.");
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        console.log("[authSlice/logoutUser.fulfilled] Logout completado. isLoading se pondrá en false por onAuthStateChanged -> setUser(null).");
        // state.isLoading = false; // No es necesario aquí, setUser lo hará.
        // user e isAuthenticated serán actualizados por onAuthStateChanged via setUser(null)
      })
      .addCase(logoutUser.rejected, (state, action) => {
        console.error("[authSlice/logoutUser.rejected] Error en logout:", action.payload);
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateUserProfilePhoto.pending, (state) => { // Manejar pending para la actualización de foto
        state.isLoading = true; // O un flag específico como isProfilePhotoUploading
        state.error = null;
      })
      .addCase(updateUserProfilePhoto.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) {
          state.user.photoURL = action.payload; 
        }
      })
      .addCase(updateUserProfilePhoto.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload; // Guardar el error de actualización de foto
        console.error("Fallo al actualizar foto de perfil en slice:", action.payload);
      });
  }
});

export const { setUser, setLoading, setError } = authSlice.actions;

export default authSlice.reducer;