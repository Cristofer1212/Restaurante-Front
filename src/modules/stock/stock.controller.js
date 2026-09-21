/**
 * CONTROLADOR DE CONTROL DE STOCK (Almacén)
 */

import { stockHtml } from './stock.template.js';
import { sessionStore } from '../../core/storage/session-store.js';
import { router } from '../../core/router/router.js';
import { AttendanceModalComponent } from '../auth/components/attendance-modal.component.js';
import { authHtml } from '../auth/auth.template.js';
import { DOM } from '../../shared/utils/dom.js';

export class StockController {
  constructor() {
    this.container = null;
  }

  async mount(container) {
    this.container = container;
    this.container.innerHTML = stockHtml;

    const user = sessionStore.getUser();
    if (user) {
      const nameEl = this.container.querySelector('#stock-operator-name');
      if (nameEl) nameEl.textContent = user.nombreCompleto || user.nombreUsuario;
    }

    const lockBtn = this.container.querySelector('#btn-stock-lock');
    if (lockBtn) {
      lockBtn.addEventListener('click', () => {
        router.navigate('/auth');
      });
    }

    const attBtn = this.container.querySelector('#btn-stock-attendance');
    if (attBtn) {
      attBtn.addEventListener('click', () => {
        this._openAttendanceModal();
      });
    }
  }

  _openAttendanceModal() {
    let modalRoot = document.getElementById('stock-modal-root');
    if (!modalRoot) {
      modalRoot = DOM.create('div', { id: 'stock-modal-root' });
      const temp = document.createElement('div');
      temp.innerHTML = authHtml;
      const modalEl = temp.querySelector('#attendance-modal');
      if (modalEl) modalRoot.appendChild(modalEl);
      document.body.appendChild(modalRoot);
    }

    const modal = new AttendanceModalComponent({
      container: modalRoot,
      onProceed: () => modal.hide(),
    });
    modal.show(sessionStore.getUser());
  }

  unmount() {
    const modalRoot = document.getElementById('stock-modal-root');
    if (modalRoot) modalRoot.remove();
  }
}

export const stockController = new StockController();
