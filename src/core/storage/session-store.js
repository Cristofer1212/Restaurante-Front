/**
 * ALMACENAMIENTO DE SESIÓN REACTIVO (Session Store)
 * 
 * Gestiona el estado de autenticación del operador, token JWT y RoleUiMetadata
 * emitido por el backend Java.
 */

import { ENV } from '../config/env.js';

class SessionStore {
  constructor() {
    this._listeners = new Set();
    this._memoryStorage = {};
  }

  _getItem(key) {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return this._memoryStorage[key] || null;
  }

  _setItem(key, value) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    } else {
      this._memoryStorage[key] = String(value);
    }
  }

  _removeItem(key) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    } else {
      delete this._memoryStorage[key];
    }
  }

  saveSession({ token, usuarioId, nombreCompleto, nombreUsuario, rol, requiresClockIn, uiMetadata }) {
    const sessionData = {
      usuarioId,
      nombreCompleto,
      nombreUsuario,
      rol,
      requiresClockIn,
      loginAt: new Date().toISOString(),
    };

    this._setItem(ENV.STORAGE_KEYS.TOKEN, token);
    this._setItem(ENV.STORAGE_KEYS.USER, JSON.stringify(sessionData));
    this._setItem(ENV.STORAGE_KEYS.UI_METADATA, JSON.stringify(uiMetadata));

    this._notify({ type: 'LOGIN', session: sessionData, token, uiMetadata });
  }

  getToken() {
    return this._getItem(ENV.STORAGE_KEYS.TOKEN) || null;
  }

  getUser() {
    const raw = this._getItem(ENV.STORAGE_KEYS.USER);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  getUiMetadata() {
    const raw = this._getItem(ENV.STORAGE_KEYS.UI_METADATA);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  saveAttendance(attendanceData) {
    this._setItem(ENV.STORAGE_KEYS.LAST_ATTENDANCE, JSON.stringify(attendanceData));
    
    // Si marcamos Clock-In, actualizamos requiresClockIn a false en la sesión activa
    const user = this.getUser();
    if (user && attendanceData.estado === 'ACTIVO') {
      user.requiresClockIn = false;
      this._setItem(ENV.STORAGE_KEYS.USER, JSON.stringify(user));
    }
    
    this._notify({ type: 'ATTENDANCE_UPDATED', attendance: attendanceData });
  }

  getLastAttendance() {
    const raw = this._getItem(ENV.STORAGE_KEYS.LAST_ATTENDANCE);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated() {
    return !!this.getToken() && !!this.getUser();
  }

  clearSession() {
    this._removeItem(ENV.STORAGE_KEYS.TOKEN);
    this._removeItem(ENV.STORAGE_KEYS.USER);
    this._removeItem(ENV.STORAGE_KEYS.UI_METADATA);
    this._notify({ type: 'LOGOUT' });
  }

  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  _notify(payload) {
    for (const listener of this._listeners) {
      try {
        listener(payload);
      } catch (err) {
        console.error('[SessionStore] Error en suscriptor:', err);
      }
    }
  }
}

export const sessionStore = new SessionStore();
