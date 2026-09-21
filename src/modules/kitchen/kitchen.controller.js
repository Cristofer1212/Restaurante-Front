/**
 * CONTROLADOR DE PANTALLA KDS (Cocina)
 */

import { kitchenHtml } from './kitchen.template.js';
import { sessionStore } from '../../core/storage/session-store.js';
import { router } from '../../core/router/router.js';
import { AttendanceModalComponent } from '../auth/components/attendance-modal.component.js';
import { authHtml } from '../auth/auth.template.js';
import { DOM } from '../../shared/utils/dom.js';

export class KitchenController {
  constructor() {
    this.container = null;
    this.attendanceModal = null;
  }

  async mount(container) {
    this.container = container;
    this.container.innerHTML = kitchenHtml;

    const user = sessionStore.getUser();
    if (user) {
      const nameEl = this.container.querySelector('#kds-operator-name');
      if (nameEl) nameEl.textContent = user.nombreCompleto || user.nombreUsuario;
    }

    // Botón de bloqueo manual
    const lockBtn = this.container.querySelector('#btn-kds-lock');
    if (lockBtn) {
      lockBtn.addEventListener('click', () => {
        router.navigate('/auth');
      });
    }

    // Botón de marcación de asistencia
    const attBtn = this.container.querySelector('#btn-kds-attendance');
    if (attBtn) {
      attBtn.addEventListener('click', () => {
        this._openAttendanceModal();
      });
    }
  }

  _openAttendanceModal() {
    let modalRoot = document.getElementById('kds-modal-root');
    if (!modalRoot) {
      modalRoot = DOM.create('div', { id: 'kds-modal-root' });
      // Insertar el fragmento modal del auth template
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
    const modalRoot = document.getElementById('kds-modal-root');
    if (modalRoot) modalRoot.remove();
  }
}

export const kitchenController = new KitchenController();
