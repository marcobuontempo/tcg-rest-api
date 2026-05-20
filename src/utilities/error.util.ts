export class ApiError {
  code: number;
  message: string;
  error?: Error | unknown;

  constructor(code: number, message: string, error?: Error | unknown) {
    this.code = code;
    this.message = message;
    this.error = error;
  }

  static badRequest(message: string) {
    const displayMessage = message ? `Bad Request - ${message}` : "Bad Request";
    return new ApiError(400, displayMessage);
  }

  static unauthorised(message?: string) {
    const displayMessage = message
      ? `Unauthorised Access - ${message}`
      : "Unauthorised Access";
    return new ApiError(401, displayMessage);
  }

  static forbidden(message?: string) {
    const displayMessage = message
      ? `Forbidden Access - ${message}`
      : "Forbidden Access";
    return new ApiError(403, displayMessage);
  }

  static notFound(message?: string) {
    const displayMessage = message
      ? `Resource Not Found - ${message}`
      : "Resource Not Found";
    return new ApiError(404, displayMessage);
  }

  static conflict(message?: string) {
    const displayMessage = message ? `Conflict - ${message}` : "Conflict";
    return new ApiError(409, displayMessage);
  }

  static tooManyRequests(message?: string) {
    const displayMessage = message
      ? `Too Many Requests - ${message}`
      : "Too Many Requests";
    return new ApiError(429, displayMessage);
  }

  static internal(message: string, error: Error | unknown) {
    return new ApiError(500, `Internal Server Error - ${message}`, error);
  }
}
