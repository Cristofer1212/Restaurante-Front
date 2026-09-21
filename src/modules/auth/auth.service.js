/**
 * ADAPTADOR DE SALIDA HTTP DEL MÓDULO AUTH (auth.service.js)
 * 
 * Simetría estricta con la Arquitectura Hexagonal del backend en Java:
 * - Puerto de salida hacia AuthHttpHandler (/register, /login-pin)
 * - Puerto de salida hacia AsistenciaHttpHandler (/clock-in, /clock-out)
 * - Comunicación 100% real por HTTP con el backend en Java SE (http://localhost:8080)
 */

import { apiClient } from '../../core/http/api-client.js';
import { ENV } from '../../core/config/env.js';
import { sessionStore } from '../../core/storage/session-store.js';
import { inactivityTimer } from '../../core/security/inactivity-timer.js';
import { eventBus, AppEvents } from '../../core/events/event-bus.js';
import { LoginPinRequest, ClockRequest, RegisterUserRequest } from './models/auth.models.js';

export class AuthService {
  /**
   * Registro de Colaboradores (Exclusivo para la Vista de Administrador / Backoffice)
   * Endpoint backend: POST /api/v1/auth/register
   * 
   * @param {Object} userData - rolId, tipoDocumento, numeroDocumento, nombre, apellido, nombreUsuario, pin
   * @returns {Promise<Object>} Datos del colaborador creado
   */
  async register(userData) {
    const requestDto = new RegisterUserRequest(userData);
    requestDto.validate();

    const response = await apiClient.post(ENV.ENDPOINTS.AUTH_REGISTER, requestDto.toJSON());
    const newUser = response.data;

    // Guardar en el registro local de colaboradores para visualización en el panel
    this._saveRegisteredCollaborator(newUser);

    return newUser;
  }

  /**
   * Inicio de Sesión por PIN de 4 Dígitos (Terminal Operativa Táctil)
   * Endpoint backend: POST /api/v1/auth/login-pin
   * 
   * @param {string} identifier - DNI o nombre de usuario
   * @param {string} pin - PIN numérico de 4 dígitos
   * @returns {Promise<Object>} Datos de sesión, token JWT y RoleUiMetadata
   */
  async loginWithPin(identifier, pin) {
    const requestDto = new LoginPinRequest(identifier, pin);
    requestDto.validate();

    const response = await apiClient.post(ENV.ENDPOINTS.AUTH_LOGIN_PIN, requestDto.toJSON());
    const loginData = response.data;

    // 1. Guardar estado de sesión en almacenamiento local
    sessionStore.saveSession(loginData);

    // 2. Configurar auto-bloqueo o pantalla fija según RoleUiMetadata del backend
    if (loginData.uiMetadata) {
      inactivityTimer.configure(loginData.uiMetadata);
    }

    // 3. Notificar al sistema
    eventBus.emit(AppEvents.AUTH_SUCCESS, loginData);

    return loginData;
  }

  /**
   * Registro de Marcación de Entrada (Clock-In) - Planilla Perú
   * Endpoint backend: POST /api/v1/asistencia/clock-in
   * 
   * @param {number} usuarioId - ID del colaborador autenticado
   * @returns {Promise<Object>} Registro de jornada laboral
   */
  async clockIn(usuarioId) {
    const requestDto = new ClockRequest(usuarioId);
    requestDto.validate();

    const response = await apiClient.post(ENV.ENDPOINTS.ASISTENCIA_CLOCK_IN, requestDto.toJSON());
    const attendanceData = response.data;

    sessionStore.saveAttendance(attendanceData);
    eventBus.emit(AppEvents.CLOCK_IN_SUCCESS, attendanceData);

    return attendanceData;
  }

  /**
   * Registro de Marcación de Salida (Clock-Out)
   * Endpoint backend: POST /api/v1/asistencia/clock-out
   * 
   * @param {number} usuarioId - ID del colaborador autenticado
   * @returns {Promise<Object>} Cierre de jornada laboral
   */
  async clockOut(usuarioId) {
    const requestDto = new ClockRequest(usuarioId);
    requestDto.validate();

    const response = await apiClient.post(ENV.ENDPOINTS.ASISTENCIA_CLOCK_OUT, requestDto.toJSON());
    const attendanceData = response.data;

    sessionStore.saveAttendance(attendanceData);
    eventBus.emit(AppEvents.CLOCK_OUT_SUCCESS, attendanceData);

    return attendanceData;
  }

  /**
   * Cierra la sesión activa en el terminal
   */
  logout() {
    inactivityTimer.stop();
    sessionStore.clearSession();
    eventBus.emit(AppEvents.AUTH_LOGOUT);
  }

  getCurrentUser() {
    return sessionStore.getUser();
  }

  getLastAttendance() {
    return sessionStore.getLastAttendance();
  }

  isAuthenticated() {
    return sessionStore.isAuthenticated();
  }

  /**
   * Comprueba el estado de salud del backend Java
   */
  async checkBackendHealth() {
    return apiClient.checkHealth();
  }

  /**
   * Obtiene la lista de colaboradores registrados en el sistema
   */
  getRegisteredCollaborators() {
    const raw = localStorage.getItem(ENV.STORAGE_KEYS.REGISTERED_COLLABORATORS);
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  _saveRegisteredCollaborator(user) {
    const list = this.getRegisteredCollaborators();
    // Evitar duplicados por DNI
    const filtered = list.filter(u => u.numeroDocumento !== user.numeroDocumento);
    filtered.unshift(user);
    localStorage.setItem(ENV.STORAGE_KEYS.REGISTERED_COLLABORATORS, JSON.stringify(filtered));
  }
}

export const authService = new AuthService();
