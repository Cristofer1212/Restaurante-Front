/**
 * EVENT BUS NATIVO
 * 
 * Facilita el desacoplamiento total entre módulos de la arquitectura (Auth, Cocina, Stock)
 * sin acoplamiento a frameworks.
 */

class EventBus {
  constructor() {
    this.events = new Map();
  }

  on(eventName, handler) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    this.events.get(eventName).add(handler);
    return () => this.off(eventName, handler);
  }

  off(eventName, handler) {
    if (this.events.has(eventName)) {
      this.events.get(eventName).delete(handler);
    }
  }

  emit(eventName, data) {
    if (this.events.has(eventName)) {
      this.events.get(eventName).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[EventBus] Error en manejador de evento '${eventName}':`, error);
        }
      });
    }
  }
}

export const eventBus = new EventBus();

// Constantes de eventos estándar del sistema
export const AppEvents = {
  AUTH_SUCCESS: 'auth:success',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_ERROR: 'auth:error',
  CLOCK_IN_SUCCESS: 'attendance:clock-in:success',
  CLOCK_OUT_SUCCESS: 'attendance:clock-out:success',
  SESSION_LOCKED: 'session:locked',
  SESSION_UNLOCKED: 'session:unlocked',
  NAVIGATE: 'router:navigate',
  TOAST: 'ui:toast',
};
