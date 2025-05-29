// src/database/sqlite.js
// Configuración y helpers para SQLite.
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const dbName = 'petshop.db';

function openDB() {
  if (Platform.OS === "web") { // SQLite no es soportado directamente en web por expo-sqlite de la misma manera
    return {
      transaction: () => { // Mock transaction para evitar errores en web
        return {
          executeSql: () => {},
        };
      },
    };
  }
  return SQLite.openDatabase(dbName);
}

const db = openDB();

export const initDB = () => {
  if (Platform.OS === "web") {
    return Promise.resolve(); // No hacer nada en web por ahora
  }
  const promise = new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS cart_items (
          id TEXT PRIMARY KEY NOT NULL,
          productId TEXT NOT NULL, 
          name TEXT NOT NULL,
          price REAL NOT NULL,
          quantity INTEGER NOT NULL,
          imageUrl TEXT
        );`,
        [],
        () => { 
          console.log('[sqlite.js] Tabla cart_items creada o ya existe.');
          resolve(); 
        },
        (_, err) => { 
          console.error('[sqlite.js] Error creando tabla cart_items:', err);
          reject(err); 
          return false; // Para typescript, indica que la transacción falló
        }
      );
    });
  });
  return promise;
};

// Funciones CRUD para el carrito en SQLite
export const insertCartItemDB = (item) => {
  if (Platform.OS === "web") return Promise.resolve();
  const promise = new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT OR REPLACE INTO cart_items (id, productId, name, price, quantity, imageUrl) VALUES (?, ?, ?, ?, ?, ?);`,
        // Usamos el id del producto como id en la tabla del carrito para simplificar y evitar duplicados por id de item.
        [item.id, item.id, item.name, item.price, item.quantity, item.imageUrl],
        (_, result) => { 
          console.log('[sqlite.js] Item insertado/reemplazado en cart_items:', item.id);
          resolve(result); 
        },
        (_, err) => { 
          console.error('[sqlite.js] Error insertando item en cart_items:', err);
          reject(err); 
          return false;
        }
      );
    });
  });
  return promise;
};

export const updateCartItemQuantityDB = (itemId, quantity) => {
  if (Platform.OS === "web") return Promise.resolve();
  const promise = new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE cart_items SET quantity = ? WHERE id = ?;`,
        [quantity, itemId],
        (_, result) => { 
          console.log('[sqlite.js] Cantidad de item actualizada en cart_items:', itemId, quantity);
          resolve(result); 
        },
        (_, err) => { 
          console.error('[sqlite.js] Error actualizando cantidad de item en cart_items:', err);
          reject(err); 
          return false;
        }
      );
    });
  });
  return promise;
};


export const deleteCartItemDB = (itemId) => {
  if (Platform.OS === "web") return Promise.resolve();
  const promise = new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM cart_items WHERE id = ?;`,
        [itemId],
        (_, result) => { 
          console.log('[sqlite.js] Item eliminado de cart_items:', itemId);
          resolve(result); 
        },
        (_, err) => { 
          console.error('[sqlite.js] Error eliminando item de cart_items:', err);
          reject(err); 
          return false;
        }
      );
    });
  });
  return promise;
};

export const getCartItemsDB = () => {
  if (Platform.OS === "web") return Promise.resolve([]);
  const promise = new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM cart_items;',
        [],
        (_, result) => { 
          console.log('[sqlite.js] Items obtenidos de cart_items:', result.rows._array.length);
          resolve(result.rows._array); 
        },
        (_, err) => { 
          console.error('[sqlite.js] Error obteniendo items de cart_items:', err);
          reject(err); 
          return false;
        }
      );
    });
  });
  return promise;
};

export const clearAllCartItemsDB = () => {
  if (Platform.OS === "web") return Promise.resolve();
  const promise = new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM cart_items;',
        [],
        (_, result) => { 
          console.log('[sqlite.js] Todos los items eliminados de cart_items.');
          resolve(result); 
        },
        (_, err) => { 
          console.error('[sqlite.js] Error eliminando todos los items de cart_items:', err);
          reject(err); 
          return false;
        }
      );
    });
  });
  return promise;
};


export default db;