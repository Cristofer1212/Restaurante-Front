/**
 * COMPONENTE TOAST DE ALTA VISIBILIDAD
 * 
 * Alertas visuales no invasivas para pantallas de cocina y POS.
 */

import { eventBus, AppEvents } from '../../core/events/event-bus.js';
import { DOM } from '../utils/dom.js';

class ToastManager {
  constructor() {
    this.container = null;
    this._init();
  }

  _init() {
    let el = document.getElementById('toast-container');
    if (!el) {
      el = DOM.create('div', { id: 'toast-container' });
      document.body.appendChild(el);
    }
    this.container = el;

    eventBus.on(AppEvents.TOAST, (payload) => this.show(payload));
  }

  show({ type = 'info', title = '', message = '', duration = 4500 }) {
    if (!this.container) this._init();

    const toast = DOM.create('div', { className: `toast toast-${type} glass-panel` });

    const iconSvg = this._getIconSvg(type);

    toast.innerHTML = `
      <div style="flex-shrink: 0; margin-top: 2px;">
        ${iconSvg}
      </div>
      <div style="flex: 1; min-width: 0;">
        ${title ? `<div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 2px; color: var(--color-navy-900);">${title}</div>` : ''}
        <div style="font-size: 0.875rem; color: var(--color-navy-700); line-height: 1.4;">${message}</div>
      </div>
      <button class="toast-close" style="flex-shrink: 0; color: var(--color-navy-500); padding: 4px; border-radius: 4px; line-height: 1;" aria-label="Cerrar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this._removeToast(toast));

    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => this._removeToast(toast), duration);
    }

    return toast;
  }

  _removeToast(toast) {
    if (!toast || !toast.parentElement) return;
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 200);
  }

  _getIconSvg(type) {
    switch (type) {
      case 'success':
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>`;
      case 'warning':
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>`;
      case 'danger':
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>`;
      case 'info':
      default:
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E15A2B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>`;
    }
  }

  success(message, title = 'Operación Exitosa') {
    return this.show({ type: 'success', title, message });
  }

  warning(message, title = 'Atención') {
    return this.show({ type: 'warning', title, message });
  }

  danger(message, title = 'Error') {
    return this.show({ type: 'danger', title, message });
  }

  info(message, title = 'Información') {
    return this.show({ type: 'info', title, message });
  }
}

export const Toast = new ToastManager();
