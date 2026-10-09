/**
 * CONTROLADOR: REGISTRO Y LOGIN DE ADMINISTRADOR / DUEÑO (register.controller.js)
 * 
 * Flujo:
 * 1. El usuario hace clic en "Empezar" en la Landing Page -> Llega a /register.
 * 2. Registra su cuenta de Administrador (rolId: 1) en PostgreSQL mediante POST /api/v1/auth/register.
 * 3. Se autentica automáticamente mediante POST /api/v1/auth/login-pin.
 * 4. Es redirigido al Dashboard Principal / Backoffice (#/admin).
 */

import { registerHtml } from '../../pages/register.template.js';
import { authService } from '../services/auth.service.js';
import { Toast } from '../components/toast.component.js';
import { audioFeedback } from '../utils/dom.js';
import { router } from '../core/router/router.js';

export class RegisterController {
  constructor() {
    this.container = null;
    this.activeTab = 'register'; // 'register' | 'login'
  }

  async mount(container) {
    this.container = container;
    this.container.innerHTML = registerHtml;

    // Detectar si la ruta incluye el parámetro ?mode=login
    const hash = window.location.hash;
    if (hash.includes('mode=login')) {
      this.activeTab = 'login';
    } else {
      this.activeTab = 'register';
    }

    this._initTabs();
    this._initRegisterForm();
    this._initLoginForm();
    this._initPinToggles();
  }

  _initTabs() {
    const tabRegisterBtn = this.container.querySelector('#tab-register-btn');
    const tabLoginBtn = this.container.querySelector('#tab-login-btn');
    const sectionRegister = this.container.querySelector('#section-register');
    const sectionLogin = this.container.querySelector('#section-login');

    const setTab = (tab) => {
      this.activeTab = tab;
      if (tab === 'register') {
        tabRegisterBtn.classList.add('active');
        tabLoginBtn.classList.remove('active');
        sectionRegister.style.display = 'block';
        sectionLogin.style.display = 'none';
      } else {
        tabLoginBtn.classList.add('active');
        tabRegisterBtn.classList.remove('active');
        sectionRegister.style.display = 'none';
        sectionLogin.style.display = 'block';
      }
    };

    tabRegisterBtn.addEventListener('click', () => setTab('register'));
    tabLoginBtn.addEventListener('click', () => setTab('login'));

    setTab(this.activeTab);
  }

  _initRegisterForm() {
    const form = this.container.querySelector('#form-owner-register');
    const submitBtn = this.container.querySelector('#btn-submit-owner-register');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre = this.container.querySelector('#owner-nombre').value.trim();
      const apellido = this.container.querySelector('#owner-apellido').value.trim();
      const tipoDocumento = this.container.querySelector('#owner-tipo-doc').value;
      const numeroDocumento = this.container.querySelector('#owner-num-doc').value.trim();
      const nombreUsuario = this.container.querySelector('#owner-username').value.trim();
      const pin = this.container.querySelector('#owner-pin').value.trim();
      const pinConfirm = this.container.querySelector('#owner-pin-confirm').value.trim();

      // Validaciones previas
      if (!nombre || !apellido || !numeroDocumento || !nombreUsuario) {
        audioFeedback.playError();
        Toast.warning('Por favor complete todos los campos obligatorios (*)', 'Campos Incompletos');
        return;
      }

      if (!/^\d{4}$/.test(pin)) {
        audioFeedback.playError();
        Toast.danger('El PIN debe constar exactamente de 4 dígitos numéricos', 'Validación de PIN');
        return;
      }

      if (pin !== pinConfirm) {
        audioFeedback.playError();
        Toast.danger('Los PINs ingresados no coinciden', 'Validación de PIN');
        return;
      }

      const payload = {
        rolId: 1, // Rol Administrador en DatabaseInitializer.java
        tipoDocumento,
        numeroDocumento,
        nombre,
        apellido,
        nombreUsuario,
        pin,
      };

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="status-dot online"></span> Guardando cuenta...
        `;

        // 1. Registrar Administrador
        const createdUser = await authService.register(payload);

        // 2. Iniciar sesión automáticamente con el PIN recién configurado
        submitBtn.innerHTML = `
          <span class="status-dot online"></span> Autenticando sesión...
        `;
        const session = await authService.loginWithPin(numeroDocumento, pin);

        audioFeedback.playSuccess();
        Toast.success(
          `¡Bienvenido, ${session.nombreCompleto || createdUser.nombre}! Tu cuenta de Administrador ha sido configurada.`,
          'Registro Exitoso'
        );

        // 3. Redirigir al Dashboard Principal / Backoffice (#/admin)
        setTimeout(() => {
          router.navigate('/admin');
        }, 400);

      } catch (err) {
        audioFeedback.playError();
        Toast.danger(err.message || 'Error al crear la cuenta de Administrador', 'Error de Registro');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <polyline points="17 11 19 13 23 9"></polyline>
          </svg>
          Crear Cuenta & Entrar al Dashboard →
        `;
      }
    });
  }

  _initLoginForm() {
    const form = this.container.querySelector('#form-owner-login');
    const submitBtn = this.container.querySelector('#btn-submit-owner-login');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const identifier = this.container.querySelector('#login-admin-identifier').value.trim();
      const pin = this.container.querySelector('#login-admin-pin').value.trim();

      if (!identifier) {
        audioFeedback.playError();
        Toast.warning('Ingrese su DNI o usuario de Administrador', 'Identificador Requerido');
        return;
      }

      if (!/^\d{4}$/.test(pin)) {
        audioFeedback.playError();
        Toast.danger('El PIN debe constar exactamente de 4 dígitos numéricos', 'PIN Inválido');
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Validando credenciales...';

        const session = await authService.loginWithPin(identifier, pin);

        audioFeedback.playSuccess();
        Toast.success(`Sesión iniciada como ${session.nombreCompleto}`, 'Acceso Concedido');

        // Redirigir al Dashboard
        setTimeout(() => {
          if (session.rol === 'ADMIN') {
            router.navigate('/admin');
          } else {
            router.navigate('/admin'); // El guard o router gestiona
          }
        }, 300);

      } catch (err) {
        audioFeedback.playError();
        Toast.danger(err.message || 'Credenciales de Administrador incorrectas', 'Error de Acceso');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Ingresar al Dashboard Backoffice →';
      }
    });
  }

  _initPinToggles() {
    const toggleBtns = this.container.querySelectorAll('.btn-toggle-pin-field');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input = this.container.querySelector(`#${targetId}`);
        if (!input) return;

        const isPwd = input.type === 'password';
        input.type = isPwd ? 'text' : 'password';
        btn.textContent = isPwd ? '🔒' : '👁️';
      });
    });
  }

  unmount() {
    // Limpieza
  }
}

export const registerController = new RegisterController();
