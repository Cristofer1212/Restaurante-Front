/**
 * ENRUTADOR CLIENTE NATIVO (Zero-Framework Hash Router)
 * 
 * Gestiona navegación ágil de terminales sin recarga del DOM,
 * con protección de rutas (Auth Guards) y soporte para arquitectura multiusuario:
 * - Ruta Raíz ("/") -> Landing Page corporativa (Square style)
 * - /register -> Registro de cuenta de Administrador / Dueño ("Empezar")
 * - /terminal -> Terminal de Personal para operarios ("Soy empleado")
 * - /admin -> Dashboard Principal / Backoffice gerencial
 * - /kitchen, /stock -> Estaciones operativas protegidas por rol
 */

import { sessionStore } from '../storage/session-store.js';
import { eventBus, AppEvents } from '../events/event-bus.js';

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.currentRouteConfig = null;
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
    let rawHash = window.location.hash;
    // Si inicia con #, removerlo
    if (rawHash.startsWith('#')) {
      rawHash = rawHash.slice(1);
    }

    // Descartar query parameters para resolución de ruta base
    const [pathOnly] = rawHash.split('?');
    let path = pathOnly ? pathOnly.trim() : '';

    // Ruta raíz por defecto: Landing Page ("/")
    if (!path || path === '' || path === '/') {
      path = '/';
    }

    // Alias de conveniencia para la terminal operativa
    if (path === '/auth') {
      path = '/terminal';
    }

    const routeConfig = this.routes.get(path) || this.routes.get('/') || this.routes.get('/terminal');
    if (!routeConfig) return;

    // 1. Control de Autenticación (Auth Guard)
    if (routeConfig.requiresAuth && !sessionStore.isAuthenticated()) {
      console.warn(`[Router] Acceso no autenticado a ruta protegida: ${path}`);
      if (path === '/admin') {
        this.navigate('/register');
      } else {
        this.navigate('/terminal');
      }
      return;
    }

    // 2. Control de Rol de Colaborador (Role Guard)
    const user = sessionStore.getUser();
    if (routeConfig.requiresAuth && routeConfig.allowedRoles.length > 0 && user) {
      if (!routeConfig.allowedRoles.includes(user.rol)) {
        console.warn(`[Router] Rol ${user.rol} no autorizado para ${path}`);
        this.navigate(this._getDefaultRouteForRole());
        return;
      }
    }

    // 3. Desmontar componente previo si existía
    if (this.currentRouteConfig && this.currentRouteConfig.component && typeof this.currentRouteConfig.component.unmount === 'function') {
      try {
        this.currentRouteConfig.component.unmount();
      } catch (err) {
        console.error('[Router] Error al desmontar vista previa:', err);
      }
    }

    this.currentRoute = path;
    this.currentRouteConfig = routeConfig;

    // 4. Renderizar vista del componente en el contenedor principal
    if (this.containerElement && routeConfig.component) {
      this.containerElement.innerHTML = '';
      await routeConfig.component.mount(this.containerElement);
    }

    eventBus.emit(AppEvents.NAVIGATE, { path, user });
  }

  _getDefaultRouteForRole() {
    const user = sessionStore.getUser();
    if (!user) return '/';

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
