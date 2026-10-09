/**
 * MODELOS Y DTOs SIMÉTRICOS A LA ARQUITECTURA HEXAGONAL DE BACKEND
 * 
 * Simetría con com.restaurant.auth:
 * - RegisterUserRequest.java
 * - LoginPinRequest.java
 * - LoginResponse.java
 * - RoleUiMetadata.java
 * - ClockRequest.java
 * - AsistenciaResponse.java
 */

export class RegisterUserRequest {
  constructor({ rolId, tipoDocumento, numeroDocumento, nombre, apellido, nombreUsuario, pin }) {
    this.rolId = Number(rolId);
    this.tipoDocumento = (tipoDocumento || 'DNI').trim();
    this.numeroDocumento = (numeroDocumento || '').trim();
    this.nombre = (nombre || '').trim();
    this.apellido = (apellido || '').trim();
    this.nombreUsuario = (nombreUsuario || '').trim().toLowerCase();
    this.pin = String(pin || '').trim();
  }

  validate() {
    if (!this.rolId || this.rolId <= 0) {
      throw new Error('Debe seleccionar un Rol válido para el colaborador');
    }
    if (!this.tipoDocumento) {
      throw new Error('El tipo de documento es obligatorio (ej. DNI, CE)');
    }
    if (!this.numeroDocumento) {
      throw new Error('El número de documento es obligatorio');
    }
    if (!this.nombre) {
      throw new Error('El nombre del colaborador es obligatorio');
    }
    if (!this.apellido) {
      throw new Error('El apellido del colaborador es obligatorio');
    }
    if (!this.nombreUsuario) {
      throw new Error('El nombre de usuario es obligatorio');
    }
    if (!/^\d{4}$/.test(this.pin)) {
      throw new Error('El PIN debe constar exactamente de 4 dígitos numéricos');
    }
  }

  toJSON() {
    return {
      rolId: this.rolId,
      tipoDocumento: this.tipoDocumento,
      numeroDocumento: this.numeroDocumento,
      nombre: this.nombre,
      apellido: this.apellido,
      nombreUsuario: this.nombreUsuario,
      pin: this.pin,
    };
  }
}

export class LoginPinRequest {
  constructor(identifier, pin) {
    this.identifier = (identifier || '').trim();
    this.pin = String(pin || '').trim();
  }

  validate() {
    if (!this.identifier) {
      throw new Error('El identificador (DNI o nombre de usuario) es obligatorio');
    }
    if (!/^\d{4}$/.test(this.pin)) {
      throw new Error('El PIN de acceso debe contener exactamente 4 dígitos numéricos');
    }
  }

  toJSON() {
    return {
      identifier: this.identifier,
      pin: this.pin,
      rawPin: this.pin,
    };
  }
}

export class ClockRequest {
  constructor(usuarioId) {
    this.usuarioId = Number(usuarioId);
  }

  validate() {
    if (!this.usuarioId || this.usuarioId <= 0) {
      throw new Error('El ID de usuario debe ser un número entero positivo válido');
    }
  }

  toJSON() {
    return {
      usuarioId: this.usuarioId,
    };
  }
}
