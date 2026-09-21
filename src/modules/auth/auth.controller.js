/**
 * CONTROLADOR: TERMINAL DE CONTROL TÁCTIL (auth.controller.js)
 * 
 * Flujo operativo optimizado para personal de restaurante (Cocina, Almacén, Caja):
 * - Ingreso ágil mediante DNI/Usuario y PIN numérico de 4 dígitos.
 * - Llamadas 100% reales a los endpoints del backend Java SE HttpServer.
 * - Despliegue automático de control de asistencia (Clock-In) para Planilla Perú.
 * - Enlace directo al Backoffice Web para administradores.
 */

import { authService } from './auth.service.js';
import { PinPadComponent } from './components/pin-pad.component.js';
import { AttendanceModalComponent } from './components/attendance-modal.component.js';
import { Toast } from '../../shared/components/toast.component.js';
import { audioFeedback } from '../../shared/utils/dom.js';
import { router } from '../../core/router/router.js';
import { authHtml } from './auth.template.js';

export class AuthController {
  constructor() {
    this.container = null;
    this.clockInterval = null;
    this.healthInterval = null;
    this.pinPad = null;
    this.attendanceModal = null;
    this.selectedIdentifier = '';
  }

  async mount(container) {
    this.container = container;
    this.container.innerHTML = authHtml;

    this._initClock();
    this._initBackendStatus();
    this._initOperatorSelector();
    this._initPinPad();
    this._initAttendanceModal();
  }

  _initClock() {
    const timeEl = this.container.querySelector('#live-clock-time');
    const dateEl = this.container.querySelector('#live-clock-date');

    const update = () => {
      const now = new Date();
      timeEl.textContent = now.toLocaleTimeString('es-PE', { hour12: false });
      dateEl.textContent = now.toLocaleDateString('es-PE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    update();
    this.clockInterval = setInterval(update, 1000);
  }

  async _initBackendStatus() {
    const badge = this.container.querySelector('#connection-badge');
    const dot = this.container.querySelector('#backend-status-dot');
    const text = this.container.querySelector('#backend-status-text');

    const check = async () => {
      const isOnline = await authService.checkBackendHealth();
      if (isOnline) {
        if (badge) {
          badge.className = 'badge badge-success';
          badge.innerHTML = '<span class="status-dot online"></span> Backend :8080 En Línea';
        }
        if (dot) dot.className = 'status-dot online';
        if (text) text.textContent = 'Backend Java SE :8080 Conectado';
      } else {
        if (badge) {
          badge.className = 'badge badge-danger';
          badge.innerHTML = '<span class="status-dot error"></span> Servidor Desconectado';
        }
        if (dot) dot.className = 'status-dot error';
        if (text) text.textContent = 'Sin conexión con :8080';
      }
    };

    await check();
    this.healthInterval = setInterval(check, 10000);
  }

  _initOperatorSelector() {
    const grid = this.container.querySelector('#operator-grid');
    const input = this.container.querySelector('#identifier-input');
    const badgeLabel = this.container.querySelector('#active-operator-label');

    // Obtener colaboradores registrados desde el Backoffice
    const collaborators = authService.getRegisteredCollaborators();

    if (collaborators.length > 0) {
      grid.innerHTML = collaborators.map((c, index) => {
        const role = this._resolveRoleName(c.rolId);
        const isSelected = index === 0;
        if (isSelected && !this.selectedIdentifier) {
          this.selectedIdentifier = c.numeroDocumento;
          input.value = c.numeroDocumento;
          badgeLabel.textContent = `${c.nombreCompleto || c.nombre} • ${role}`;
        }
        return `
          <button type="button" class="operator-card ${isSelected ? 'selected' : ''}" 
                  data-id="${c.numeroDocumento}" 
                  data-name="${c.nombreCompleto || (c.nombre + ' ' + c.apellido)}" 
                  data-role="${role}">
            <span class="operator-name">${c.nombreCompleto || (c.nombre + ' ' + c.apellido)}</span>
            <span class="operator-role-pill role-${role.toLowerCase()}">${role}</span>
          </button>
        `;
      }).join('');
    } else {
      // Estado inicial si aún no se han registrado colaboradores en este terminal
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 1rem; background: var(--color-bg-subtle); border-radius: var(--border-radius-md); font-size: 0.88rem; color: var(--color-navy-600);">
          <strong>ℹ️ Sin colaboradores guardados localmente:</strong> Ingrese su DNI abajo o diríjase a 
          <a href="#/admin" style="color: var(--color-brand-primary); font-weight: 700; text-decoration: underline;">Backoffice Administrador</a> 
          para registrar cuentas en PostgreSQL.
        </div>
      `;
    }

    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.operator-card');
      if (!card) return;

      audioFeedback.playKeyTap();

      grid.querySelectorAll('.operator-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      const id = card.dataset.id;
      const name = card.dataset.name;
      const role = card.dataset.role;

      this.selectedIdentifier = id;
      input.value = id;
      badgeLabel.textContent = `${name} • ${role}`;

      if (this.pinPad) {
        this.pinPad.clear();
      }
    });

    input.addEventListener('input', (e) => {
      this.selectedIdentifier = e.target.value.trim();
      badgeLabel.textContent = this.selectedIdentifier 
        ? `Identificador: ${this.selectedIdentifier}` 
        : 'Ingrese su Identificador';
      
      grid.querySelectorAll('.operator-card').forEach(c => {
        if (c.dataset.id === this.selectedIdentifier) {
          c.classList.add('selected');
        } else {
          c.classList.remove('selected');
        }
      });
    });
  }

  _resolveRoleName(rolId) {
    switch (Number(rolId)) {
      case 1: return 'ADMIN';
      case 2: return 'ALMACENERO';
      case 3: return 'COCINA';
      case 4: return 'MOZO';
      case 5: return 'CAJERO';
      default: return 'OPERADOR';
    }
  }

  _initPinPad() {
    const rightPane = this.container.querySelector('.auth-right-pane');
    
    this.pinPad = new PinPadComponent({
      container: rightPane,
      onComplete: async (pin) => {
        await this._handleLogin(this.selectedIdentifier, pin);
      },
    });
  }

  _initAttendanceModal() {
    this.attendanceModal = new AttendanceModalComponent({
      container: this.container,
      onProceed: (user) => {
        this._navigateToRoleView(user.rol);
      },
    });
  }

  async _handleLogin(identifier, pin) {
    if (!identifier) {
      audioFeedback.playError();
      Toast.warning('Por favor ingrese o seleccione su DNI o usuario', 'Identificador Requerido');
      throw new Error('Identificador no especificado');
    }

    try {
      // Llamada directa y real a POST /api/v1/auth/login-pin en el backend Java
      const userSession = await authService.loginWithPin(identifier, pin);

      audioFeedback.playSuccess();
      Toast.success(`Acceso concedido a ${userSession.nombreCompleto}`, 'Autenticación Exitosa');

      // Si el backend indica que requiere marcación de asistencia hoy
      if (userSession.requiresClockIn) {
        setTimeout(() => {
          this.attendanceModal.show(userSession);
        }, 300);
      } else {
        setTimeout(() => {
          this._navigateToRoleView(userSession.rol);
        }, 500);
      }
    } catch (error) {
      audioFeedback.playError();
      Toast.danger(error.message || 'Credenciales o PIN inválido', 'Error de Autenticación');
      throw error; // Propagar al PinPad para activar la animación 'shake'
    }
  }

  _navigateToRoleView(rol) {
    switch (rol) {
      case 'COCINA':
        router.navigate('/kitchen');
        break;
      case 'ALMACENERO':
        router.navigate('/stock');
        break;
      case 'ADMIN':
        router.navigate('/admin');
        break;
      case 'CAJERO':
      case 'MOZO':
      default:
        router.navigate('/kitchen');
        break;
    }
  }

  unmount() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
      this.clockInterval = null;
    }
    if (this.healthInterval) {
      clearInterval(this.healthInterval);
      this.healthInterval = null;
    }
    if (this.pinPad) {
      this.pinPad.destroy();
      this.pinPad = null;
    }
  }
}

export const authController = new AuthController();
