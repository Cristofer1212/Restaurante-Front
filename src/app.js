/**
 * BOOTSTRAPPER PRINCIPAL DE LA APLICACIÓN (app.js)
 * 
 * Orquesta módulos, enrutador cliente, seguridad y ciclo de vida del POS.
 * Rutas separadas tipo Square:
 * - /admin: Backoffice Web para Administradores (Gestión y alta de personal)
 * - /terminal: Terminal de Control Táctil (PIN Pad y Asistencia para operarios)
 * - /kitchen: Comandero Digital KDS (Cocina)
 * - /stock: Control de Insumos y Stock (Almacén)
 */

import { router } from './core/router/router.js';
import { eventBus, AppEvents } from './core/events/event-bus.js';
import { inactivityTimer } from './core/security/inactivity-timer.js';
import { sessionStore } from './core/storage/session-store.js';
import { Toast } from './shared/components/toast.component.js';

import { authController } from './modules/auth/auth.controller.js';
import { adminController } from './modules/admin/admin.controller.js';
import { kitchenController } from './modules/kitchen/kitchen.controller.js';
import { stockController } from './modules/stock/stock.controller.js';

class Application {
  constructor() {
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;

    console.log('%c[Square Gastro POS & KDS] Iniciando Sistema de Alto Rendimiento', 'color: #E15A2B; font-weight: bold; font-size: 14px;');

    // 1. Configurar escuchadores globales de eventos del EventBus
    this._setupEventSubscriptions();

    // 2. Registrar módulos en el enrutador cliente

    // Vista de Administrador: Backoffice Web
    router.register('/admin', {
      component: adminController,
      requiresAuth: false, // Accesible para configuración de colaboradores
    });

    // Vista de Terminal de Control: Pantalla táctil de acceso rápido
    router.register('/terminal', {
      component: authController,
      requiresAuth: false,
    });

    // Alias /auth
    router.register('/auth', {
      component: authController,
      requiresAuth: false,
    });

    // Estaciones de Trabajo Operativas (Protegidas por Rol)
    router.register('/kitchen', {
      component: kitchenController,
      requiresAuth: true,
      allowedRoles: ['COCINA', 'ADMIN', 'CAJERO'],
    });

    router.register('/stock', {
      component: stockController,
      requiresAuth: true,
      allowedRoles: ['ALMACENERO', 'ADMIN'],
    });

    // 3. Restaurar sesión si existía previamente
    if (sessionStore.isAuthenticated()) {
      const uiMetadata = sessionStore.getUiMetadata();
      if (uiMetadata) {
        inactivityTimer.configure(uiMetadata);
      }
    }

    // 4. Iniciar enrutador sobre el contenedor principal del DOM
    router.init('#main-content');

    this.isInitialized = true;
  }

  _setupEventSubscriptions() {
    // Al bloquear sesión por inactividad o expiración
    eventBus.on(AppEvents.SESSION_LOCKED, ({ reason }) => {
      Toast.warning('Terminal bloqueado por seguridad.', 'Sesión Pausada');
      router.navigate('/terminal');
    });

    // Al cerrar sesión explícitamente
    eventBus.on(AppEvents.AUTH_LOGOUT, () => {
      Toast.info('Sesión cerrada correctamente.', 'Desconectado');
      router.navigate('/terminal');
    });

    // Notificaciones de marcación de asistencia
    eventBus.on(AppEvents.CLOCK_IN_SUCCESS, (data) => {
      console.log('[App] Marcación de entrada confirmada:', data);
    });

    eventBus.on(AppEvents.CLOCK_OUT_SUCCESS, (data) => {
      console.log('[App] Marcación de salida confirmada:', data);
    });
  }
}

export const app = new Application();

// Arrancar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}
