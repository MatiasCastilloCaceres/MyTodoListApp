/**
 * Decoradores y utilidades para manejo de errores
 */

export class ApiException extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

export function formatErrorMessage(error: any): string {
  if (error instanceof ApiException) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ha ocurrido un error desconocido';
}
