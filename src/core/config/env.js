/**
 * CONFIGURACIÓN DE ENTORNO Y CONEXIÓN REAL CON BACKEND
 * 
 * Centraliza las rutas de la API simétricas al backend Java SE HttpServer.
 * Conexión directa a http://localhost:8080 (sin modo demo).
 */

export const ENV = {
  // URL base del backend Java SE HttpServer
  API_BASE_URL: (typeof window !== 'undefined' && window.RESTAURANT_API_URL) 
    ? window.RESTAURANT_API_URL 
    : 'http://localhost:8080',

  // Rutas simétricas a AuthHttpHandler y AsistenciaHttpHandler
  ENDPOINTS: {
    AUTH_LOGIN_PIN: '/api/v1/auth/login-pin',
    AUTH_REGISTER: '/api/v1/auth/register',
    ASISTENCIA_CLOCK_IN: '/api/v1/asistencia/clock-in',
    ASISTENCIA_CLOCK_OUT: '/api/v1/asistencia/clock-out',
  },

  // Configuración de red y timeouts (ms)
  TIMEOUT_MS: 8000,

  // Almacenamiento local de sesión y auditoría de colaboradores creados
  STORAGE_KEYS: {
    TOKEN: 'restaurant_pos_token',
    USER: 'restaurant_pos_user',
    UI_METADATA: 'restaurant_pos_ui_meta',
    LAST_ATTENDANCE: 'restaurant_pos_last_attendance',
    REGISTERED_COLLABORATORS: 'restaurant_registered_collaborators',
  },

  // Catálogo oficial de roles según DatabaseInitializer.java
  ROLES: [
    { id: 1, code: 'ADMIN', name: 'Administrador General', desc: 'Acceso a backoffice y configuración global' },
    { id: 2, code: 'ALMACENERO', name: 'Almacenero / Insumos', desc: 'Control de stock e inventarios (Auto-bloqueo 90s)' },
    { id: 3, code: 'COCINA', name: 'Jefe de Cocina (KDS)', desc: 'Pantalla fija permanente sin suspensión' },
    { id: 4, code: 'MOZO', name: 'Mozo / Salón', desc: 'Atención a comensales y comandas' },
    { id: 5, code: 'CAJERO', name: 'Cajero Principal', desc: 'Cobro, facturación y cierre de caja' },
  ],
};
