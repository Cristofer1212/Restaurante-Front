/**
 * ADAPTADOR DE SALIDA HTTP (ApiClient)
 * 
 * Conexión directa y desacoplada al backend Java SE HttpServer (http://localhost:8080).
 * Cero simuladores o modos demo: todas las operaciones viajan por HTTP real.
 */

import { ENV } from '../config/env.js';
import { HttpError } from './http-error.js';
import { sessionStore } from '../storage/session-store.js';

class ApiClient {
  constructor(baseUrl = ENV.API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Ejecuta una petición HTTP directa al servidor backend
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = sessionStore.getToken();

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const config = {
      ...options,
      headers,
    };

    // Configuración de Timeout nativo con AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ENV.TIMEOUT_MS);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw HttpError.fromBackendJson(response.status, data);
      }

      // Backend Java devuelve envoltorio ApiResponse { success, message, data, timestamp }
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof HttpError) {
        throw error;
      }

      // Error de red cuando el servidor Java está apagado o inalcanzable
      throw new HttpError({
        status: 0,
        error: 'Conexión Rechazada',
        message: `No se pudo conectar con el servidor backend en ${this.baseUrl}. Verifique que el servicio Java (RestaurantApplication) esté ejecutándose.`,
      });
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * Comprueba si el backend está en línea respondiendo peticiones HTTP
   */
  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      // Enviar OPTIONS para verificar conectividad y CORS
      const res = await fetch(`${this.baseUrl}/api/v1/auth/login-pin`, {
        method: 'OPTIONS',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.status === 204 || res.ok;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient();
