/**
 * ENRUTADOR CLIENTE NATIVO (Zero-Framework Hash Router)
 * 
 * Gestiona navegación ágil de terminales sin recarga del DOM,
 * con protección de rutas (Auth Guards) y soporte para roles.
 */

import { sessionStore } from '../storage/session-store.js';
import { eventBus, AppEvents } from '../events/event-bus.js';

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.containerElement = null;

    window.addEventListener('hashchange', () => this._handleHashChange());
  }

  init(containerSelector) {
    this.containerElement = document.querySelector(containerSelector);
    if (!this.containerElement) {
      throw new Error(`Contenedor de rutas '${containerSelector}' no encontrado en el DOM.`);
    }

    // Navegar a la ruta inicial
    this._handleHashChange();
  }

  register(path, { component, requiresAuth = true, allowedRoles = [] }) {
    this.routes.set(path, { component, requiresAuth, allowedRoles });
  }

  navigate(path) {
    window.location.hash = path;
  }

  async _handleHashChange() {
    let hash = window.location.hash.slice(1);
    if (!hash || hash === '/') {
      hash = sessionStore.isAuthenticated() ? this._getDefaultRouteForRole() : '/terminal';
    }

    // Alias de conveniencia
    if (hash === '/auth') {
      hash = '/terminal';
    }

    const routeConfig = this.routes.get(hash) || this.routes.get('/terminal');
    if (!routeConfig) return;

    // Control de Autenticación (Auth Guard)
    if (routeConfig.requiresAuth && !sessionStore.isAuthenticated()) {
      console.warn('[Router] Ruta protegida. Redirigiendo a /terminal');
      this.navigate('/terminal');
      return;
    }

    // Control de Rol de Colaborador
    const user = sessionStore.getUser();
    if (routeConfig.requiresAuth && routeConfig.allowedRoles.length > 0 && user) {
      if (!routeConfig.allowedRoles.includes(user.rol)) {
        console.warn(`[Router] Rol ${user.rol} no autorizado para ${hash}`);
        this.navigate(this._getDefaultRouteForRole());
        return;
      }
    }

    this.currentRoute = hash;

    // Renderizar vista del componente
    if (this.containerElement && routeConfig.component) {
      this.containerElement.innerHTML = '';
      await routeConfig.component.mount(this.containerElement);
    }

    eventBus.emit(AppEvents.NAVIGATE, { path: hash, user });
  }

  _getDefaultRouteForRole() {
    const user = sessionStore.getUser();
    if (!user) return '/terminal';

    switch (user.rol) {
      case 'ADMIN':
        return '/admin';
      case 'COCINA':
        return '/kitchen';
      case 'ALMACENERO':
        return '/stock';
      case 'CAJERO':
      case 'MOZO':
      default:
        return '/kitchen';
    }
  }
}

export const router = new Router();
