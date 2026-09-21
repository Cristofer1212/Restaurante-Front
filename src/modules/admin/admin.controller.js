/**
 * CONTROLADOR: VISTA DE ADMINISTRADOR (BACKOFFICE WEB)
 * 
 * Gestiona el formulario de alta de colaboradores en PostgreSQL mediante
 * el endpoint backend POST /api/v1/auth/register.
 */

import { adminHtml } from './admin.template.js';
import { authService } from '../auth/auth.service.js';
import { Toast } from '../../shared/components/toast.component.js';
import { audioFeedback } from '../../shared/utils/dom.js';
import { ENV } from '../../core/config/env.js';

export class AdminController {
  constructor() {
    this.container = null;
    this.healthCheckTimer = null;
  }

  async mount(container) {
    this.container = container;
    this.container.innerHTML = adminHtml;

    this._initHealthCheck();
    this._initForm();
    this._initRoleHints();
    this._initPinToggle();
    this._renderCollaboratorsList();

    const refreshBtn = this.container.querySelector('#btn-refresh-team');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this._renderCollaboratorsList();
        this._initHealthCheck();
        Toast.info('Lista de colaboradores actualizada');
      });
    }
  }

  async _initHealthCheck() {
    const statusEl = this.container.querySelector('#admin-backend-status');
    if (!statusEl) return;

    const isHealthy = await authService.checkBackendHealth();
    if (isHealthy) {
      statusEl.className = 'badge badge-success';
      statusEl.innerHTML = '<span class="status-dot online"></span> Backend Java :8080 Conectado';
    } else {
      statusEl.className = 'badge badge-danger';
      statusEl.innerHTML = '<span class="status-dot error"></span> Backend Desconectado (:8080)';
    }
  }

  _initForm() {
    const form = this.container.querySelector('#form-register-collaborator');
    const submitBtn = this.container.querySelector('#btn-submit-register');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const rolId = Number(this.container.querySelector('#reg-rol').value);
      const tipoDocumento = this.container.querySelector('#reg-tipo-doc').value;
      const numeroDocumento = this.container.querySelector('#reg-num-doc').value.trim();
      const nombre = this.container.querySelector('#reg-nombre').value.trim();
      const apellido = this.container.querySelector('#reg-apellido').value.trim();
      const nombreUsuario = this.container.querySelector('#reg-username').value.trim();
      const pin = this.container.querySelector('#reg-pin').value.trim();

      if (!/^\d{4}$/.test(pin)) {
        audioFeedback.playError();
        Toast.danger('El PIN debe constar exactamente de 4 dígitos numéricos', 'Validación de PIN');
        return;
      }

      const payload = {
        rolId,
        tipoDocumento,
        numeroDocumento,
        nombre,
        apellido,
        nombreUsuario,
        pin,
      };

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Enviando a PostgreSQL...';

        const createdUser = await authService.register(payload);

        audioFeedback.playSuccess();
        Toast.success(
          `Colaborador ${createdUser.nombreCompleto} registrado con éxito en la base de datos`,
          'Registro Exitoso'
        );

        form.reset();
        this._renderCollaboratorsList();
      } catch (err) {
        audioFeedback.playError();
        Toast.danger(err.message || 'Error al registrar colaborador en el backend', 'Error de Registro');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          Guardar Colaborador en PostgreSQL
        `;
      }
    });
  }

  _initRoleHints() {
    const select = this.container.querySelector('#reg-rol');
    const hint = this.container.querySelector('#role-hint');

    select.addEventListener('change', () => {
      const val = select.value;
      switch (val) {
        case '3': // COCINA
          hint.innerHTML = '💡 <strong>Comportamiento UI:</strong> Pantalla fija permanente sin suspensión para despacho ágil de comandas.';
          break;
        case '2': // ALMACENERO
          hint.innerHTML = '🔒 <strong>Comportamiento UI:</strong> Auto-bloqueo preventivo de seguridad a los 90 segundos de inactividad.';
          break;
        case '5': // CAJERO
          hint.innerHTML = '💳 <strong>Comportamiento UI:</strong> Terminal de caja con bloqueo estándar a los 120 segundos.';
          break;
        case '4': // MOZO
          hint.innerHTML = '🍽️ <strong>Comportamiento UI:</strong> Terminal móvil de salón para pedidos de mesa.';
          break;
        case '1': // ADMIN
          hint.innerHTML = '⚙️ <strong>Comportamiento UI:</strong> Acceso completo a paneles de configuración y auditoría.';
          break;
      }
    });
  }

  _initPinToggle() {
    const pinInput = this.container.querySelector('#reg-pin');
    const toggleBtn = this.container.querySelector('#btn-toggle-pin-visibility');

    toggleBtn.addEventListener('click', () => {
      const isPwd = pinInput.type === 'password';
      pinInput.type = isPwd ? 'text' : 'password';
      toggleBtn.textContent = isPwd ? '🔒' : '👁️';
    });
  }

  _renderCollaboratorsList() {
    const listEl = this.container.querySelector('#collaborators-list');
    if (!listEl) return;

    const list = authService.getRegisteredCollaborators();

    if (list.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state-box">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">👥</div>
          <strong>No hay colaboradores creados en esta sesión</strong>
          <p style="margin-top: 0.3rem;">Complete el formulario a la izquierda para dar de alta al personal.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = list.map(u => {
      const roleName = this._resolveRoleName(u.rolId);
      const rolePillClass = `role-${roleName.toLowerCase()}`;

      return `
        <div class="collaborator-item">
          <div class="collab-info">
            <span class="collab-name">${u.nombreCompleto || (u.nombre + ' ' + u.apellido)}</span>
            <span class="collab-meta">DNI: <strong>${u.numeroDocumento}</strong> • Usuario: @${u.nombreUsuario}</span>
          </div>
          <div class="collab-actions">
            <span class="operator-role-pill ${rolePillClass}">${roleName}</span>
            <button type="button" class="btn-copy-dni" data-dni="${u.numeroDocumento}" title="Copiar DNI">
              Copiar DNI
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Eventos de copia rápida de DNI
    listEl.querySelectorAll('.btn-copy-dni').forEach(btn => {
      btn.addEventListener('click', () => {
        const dni = btn.dataset.dni;
        navigator.clipboard?.writeText(dni);
        Toast.info(`DNI ${dni} copiado al portapapeles. Listo para ingresar en la Terminal Táctil.`);
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

  unmount() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }
}

export const adminController = new AdminController();
