/**
 * HTTP Error Wrapper Simétrico a com.restaurant.common.infrastructure.http.dto.ErrorResponse
 */
export class HttpError extends Error {
  constructor({ status = 500, error = 'Error de Servidor', message = 'Ha ocurrido un error inesperado', data = null, timestamp = new Date().toISOString() }) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.error = error;
    this.data = data;
    this.timestamp = timestamp;
  }

  static fromBackendJson(status, json) {
    if (json && typeof json === 'object') {
      return new HttpError({
        status: json.status || status,
        error: json.error || 'Error de Petición',
        message: json.message || 'Error no especificado por el servidor',
        timestamp: json.timestamp || new Date().toISOString(),
      });
    }
    return new HttpError({
      status,
      error: 'HTTP ' + status,
      message: 'Error en la respuesta del servidor',
    });
  }

  static networkError(originalError) {
    return new HttpError({
      status: 0,
      error: 'Error de Conexión',
      message: 'No se pudo contactar con el servidor POS. Verifique que el backend esté encendido.',
    });
  }
}
