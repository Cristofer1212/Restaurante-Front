/**
 * CONTROLADOR: LANDING PAGE CORPORATIVA (PANTALLA INICIAL)
 * 
 * Orquesta la vista principal de la aplicación ("/") según el flujo Square:
 * - Botón "Empezar": Redirige al registro de Administrador / Dueño (#/register).
 * - Botón "Soy empleado": Redirige a la Terminal de Personal (#/terminal).
 * - Indicador de salud del backend Java SE y PostgreSQL.
 * - Reconocimiento de sesión activa para reanudar turnos.
 */

import { landingHtml } from '../views/landing.template.js';
import { authService } from '../services/auth.service.js';
import { sessionStore } from '../core/storage/session-store.js';
import { router } from '../core/router/router.js';
import { Toast } from '../components/toast.component.js';

export class LandingController {
  constructor() {
    this.container = null;
    this.healthTimer = null;
  }

  async mount(container) {
    this.container = container;
    this.container.innerHTML = landingHtml;

    this._initBackendStatus();
    this._checkActiveSession();
    this._initNavActions();
  }

  async _initBackendStatus() {
    const badge = this.container.querySelector('#landing-backend-badge');
    if (!badge) return;

    const check = async () => {
      const isOnline = await authService.checkBackendHealth();
      if (isOnline) {
        badge.className = 'badge badge-success';
        badge.innerHTML = '<span class="status-dot online"></span> En Línea';
      } else {
        badge.className = 'badge badge-danger';
        badge.innerHTML = '<span class="status-dot error"></span> Sin Conexión';
      }
    };

    await check();
    this.healthTimer = setInterval(check, 12000);
  }

  _checkActiveSession() {
    const banner = this.container.querySelector('#landing-active-session-banner');
    if (!banner) return;

    if (sessionStore.isAuthenticated()) {
      const user = sessionStore.getUser();
      if (user) {
        banner.style.display = 'flex';
        const nameEl = this.container.querySelector('#landing-session-user-name');
        const roleEl = this.container.querySelector('#landing-session-user-role');
        const resumeLink = this.container.querySelector('#landing-session-resume-link');
        const logoutBtn = this.container.querySelector('#landing-session-logout-btn');

        if (nameEl) nameEl.textContent = user.nombreCompleto || user.nombreUsuario;
        if (roleEl) roleEl.textContent = user.rol;

        if (resumeLink) {
          const targetRoute = user.rol === 'ADMIN' ? '#/admin' : 
                              user.rol === 'COCINA' ? '#/kitchen' : 
                              user.rol === 'ALMACENERO' ? '#/stock' : '#/kitchen';
          resumeLink.href = targetRoute;
          resumeLink.textContent = `Continuar a ${user.rol === 'ADMIN' ? 'Backoffice' : 'Estación'} →`;
        }

        if (logoutBtn) {
          logoutBtn.addEventListener('click', () => {
            authService.logout();
            banner.style.display = 'none';
            Toast.info('Sesión cerrada correctamente');
          });
        }
      }
    } else {
      banner.style.display = 'none';
    }
  }

  _initNavActions() {
    // Escuchar enlace "¿Ya tienes cuenta? Iniciar sesión aquí"
    const loginLink = this.container.querySelector('#link-admin-login');
    if (loginLink) {
      loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        router.navigate('/register?mode=login');
      });
    }
  }

  unmount() {
    if (this.healthTimer) {
      clearInterval(this.healthTimer);
      this.healthTimer = null;
    }
  }
}

export const landingController = new LandingController();
