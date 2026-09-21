/**
 * MODAL DE CONTROL DE ASISTENCIA (CLOCK-IN / CLOCK-OUT)
 * 
 * Gestiona el registro de jornada laboral de operarios (Planilla Perú).
 */

import { authService } from '../auth.service.js';
import { Toast } from '../../../shared/components/toast.component.js';
import { audioFeedback } from '../../../shared/utils/dom.js';
import { router } from '../../../core/router/router.js';

export class AttendanceModalComponent {
  constructor({ container, onProceed }) {
    this.container = container;
    this.onProceed = onProceed;
    this.currentUser = null;

    this.modal = container.querySelector('#attendance-modal');
    this.nameEl = container.querySelector('#attendance-user-name');
    this.roleEl = container.querySelector('#attendance-user-role');
    this.userIdEl = container.querySelector('#attendance-user-id');
    this.statusTextEl = container.querySelector('#attendance-current-status');
    this.statusBadgeEl = container.querySelector('#attendance-status-badge');

    this.btnClockIn = container.querySelector('#btn-clock-in');
    this.btnClockOut = container.querySelector('#btn-clock-out');
    this.btnProceed = container.querySelector('#btn-proceed-station');
    this.btnClose = container.querySelector('#btn-close-attendance-modal');

    this._bindEvents();
  }

  _bindEvents() {
    this.btnClockIn.addEventListener('click', () => this._handleClockIn());
    this.btnClockOut.addEventListener('click', () => this._handleClockOut());
    this.btnProceed.addEventListener('click', () => this._handleProceed());
    this.btnClose.addEventListener('click', () => this.hide());

    // Cerrar al pulsar escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible()) {
        this.hide();
      }
    });
  }

  show(user, options = {}) {
    this.currentUser = user || authService.getCurrentUser();
    if (!this.currentUser) return;

    this.nameEl.textContent = this.currentUser.nombreCompleto || this.currentUser.nombreUsuario;
    this.roleEl.textContent = this.currentUser.rol;
    this.userIdEl.textContent = `ID: ${this.currentUser.usuarioId}`;

    // Estilo del pill de rol
    this.roleEl.className = 'operator-role-pill';
    const roleLower = (this.currentUser.rol || '').toLowerCase();
    this.roleEl.classList.add(`role-${roleLower}`);

    // Consultar estado de última asistencia guardada
    const lastAttendance = authService.getLastAttendance();
    this._updateAttendanceState(lastAttendance);

    this.modal.classList.add('active');
  }

  hide() {
    this.modal.classList.remove('active');
  }

  isVisible() {
    return this.modal.classList.contains('active');
  }

  async _handleClockIn() {
    if (!this.currentUser) return;

    try {
      this.btnClockIn.disabled = true;
      const res = await authService.clockIn(this.currentUser.usuarioId);

      audioFeedback.playSuccess();
      Toast.success(`Entrada registrada a las ${new Date().toLocaleTimeString('es-PE')}`, 'Clock-In Exitoso');
      this._updateAttendanceState(res);
    } catch (err) {
      audioFeedback.playError();
      Toast.danger(err.message || 'Error al registrar Clock-In', 'Falla de Asistencia');
    } finally {
      this.btnClockIn.disabled = false;
    }
  }

  async _handleClockOut() {
    if (!this.currentUser) return;

    try {
      this.btnClockOut.disabled = true;
      const res = await authService.clockOut(this.currentUser.usuarioId);

      audioFeedback.playSuccess();
      Toast.info(`Salida y fin de jornada registrados a las ${new Date().toLocaleTimeString('es-PE')}`, 'Clock-Out Exitoso');
      this._updateAttendanceState(res);
    } catch (err) {
      audioFeedback.playError();
      Toast.warning(err.message || 'Error al registrar Clock-Out', 'Falla de Salida');
    } finally {
      this.btnClockOut.disabled = false;
    }
  }

  _updateAttendanceState(attendance) {
    if (!attendance || !attendance.estado) {
      this.statusTextEl.textContent = 'Sin Marcación Registrada Hoy';
      this.statusBadgeEl.className = 'badge badge-warning';
      this.statusBadgeEl.textContent = 'Pendiente';
      this.btnClockIn.disabled = false;
      this.btnClockOut.disabled = true;
      return;
    }

    if (attendance.estado === 'ACTIVO') {
      const horaIngreso = attendance.fechaIngreso ? new Date(attendance.fechaIngreso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '';
      this.statusTextEl.textContent = `Jornada Activa (Ingreso: ${horaIngreso})`;
      this.statusBadgeEl.className = 'badge badge-success';
      this.statusBadgeEl.textContent = 'En Turno';
      this.btnClockIn.disabled = true;
      this.btnClockOut.disabled = false;
    } else if (attendance.estado === 'CERRADO') {
      const horaSalida = attendance.fechaSalida ? new Date(attendance.fechaSalida).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '';
      this.statusTextEl.textContent = `Jornada Concluida (${horaSalida})`;
      this.statusBadgeEl.className = 'badge badge-navy';
      this.statusBadgeEl.textContent = 'Cerrado';
      this.btnClockIn.disabled = false;
      this.btnClockOut.disabled = true;
    }
  }

  _handleProceed() {
    this.hide();
    if (this.onProceed) {
      this.onProceed(this.currentUser);
    } else {
      router.navigate(this._getRouteForRole(this.currentUser.rol));
    }
  }

  _getRouteForRole(rol) {
    switch (rol) {
      case 'COCINA': return '/kitchen';
      case 'ALMACENERO': return '/stock';
      default: return '/kitchen';
    }
  }
}
