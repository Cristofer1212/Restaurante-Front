/**
 * GESTOR DE BLOQUEO POR INACTIVIDAD (Inactivity Lock Manager)
 * 
 * Cumple estrictamente las directivas de RoleUiMetadata enviadas por el backend:
 * - Cocina (KDS): fixedScreen: true, timeout: 0 -> Sin auto-bloqueo para despacho continuo.
 * - Almacén: autoLock: true, timeout: 90s -> Bloqueo rápido de seguridad para inventarios.
 * - Admin / Otros: Resguardo configurable.
 */

import { sessionStore } from '../storage/session-store.js';
import { eventBus, AppEvents } from '../events/event-bus.js';

class InactivityTimer {
  constructor() {
    this.timer = null;
    this.warningTimer = null;
    this.timeoutSeconds = 0;
    this.isFixedScreen = false;
    this.isActive = false;

    this._onUserActivity = this._onUserActivity.bind(this);
  }

  configure(uiMetadata) {
    this.stop();

    if (!uiMetadata) return;

    this.isFixedScreen = Boolean(uiMetadata.fixedScreen);
    this.timeoutSeconds = uiMetadata.inactivityTimeoutSeconds || 0;

    // Si es pantalla fija o no tiene autoLock, no activar temporizador
    if (this.isFixedScreen || !uiMetadata.autoLock || this.timeoutSeconds <= 0) {
      console.log(`[InactivityTimer] Pantalla configurada como fija o sin auto-bloqueo (${uiMetadata.roleName || 'ROLE'}).`);
      return;
    }

    console.log(`[InactivityTimer] Activando auto-bloqueo a los ${this.timeoutSeconds}s para ${uiMetadata.roleName}.`);
    this.start();
  }

  start() {
    this.isActive = true;
    this._attachListeners();
    this._resetTimer();
  }

  stop() {
    this.isActive = false;
    this._detachListeners();
    this._clearTimers();
  }

  _resetTimer() {
    this._clearTimers();
    if (!this.isActive || this.timeoutSeconds <= 0) return;

    // Alerta preventiva 15 segundos antes del bloqueo
    const warningMs = Math.max((this.timeoutSeconds - 15) * 1000, 5000);
    const lockMs = this.timeoutSeconds * 1000;

    this.warningTimer = setTimeout(() => {
      eventBus.emit(AppEvents.TOAST, {
        type: 'warning',
        title: 'Bloqueo por Inactividad',
        message: 'La pantalla del terminal se bloqueará en 15 segundos por seguridad.',
        duration: 8000,
      });
    }, warningMs);

    this.timer = setTimeout(() => {
      console.warn('[InactivityTimer] Tiempo de inactividad expirado. Bloqueando terminal.');
      eventBus.emit(AppEvents.SESSION_LOCKED, { reason: 'TIMEOUT' });
    }, lockMs);
  }

  _clearTimers() {
    if (this.timer) clearTimeout(this.timer);
    if (this.warningTimer) clearTimeout(this.warningTimer);
    this.timer = null;
    this.warningTimer = null;
  }

  _onUserActivity() {
    if (this.isActive) {
      this._resetTimer();
    }
  }

  _attachListeners() {
    if (typeof window === 'undefined') return;
    const events = ['pointerdown', 'keydown', 'touchstart', 'mousemove'];
    events.forEach(evt => window.addEventListener(evt, this._onUserActivity, { passive: true }));
  }

  _detachListeners() {
    if (typeof window === 'undefined') return;
    const events = ['pointerdown', 'keydown', 'touchstart', 'mousemove'];
    events.forEach(evt => window.removeEventListener(evt, this._onUserActivity));
  }
}

export const inactivityTimer = new InactivityTimer();
