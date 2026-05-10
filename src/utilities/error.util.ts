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
    return new ApiError(400, `Bad Request - ${message}`);
  }

  static unauthorised() {
    return new ApiError(401, "Unauthorised Access");
  }

  static forbidden(message?: string) {
    const displayMessage = message
      ? `Forbidden Access - ${message}`
      : "Forbidden Access";
    return new ApiError(403, displayMessage);
  }

  static notFound() {
    return new ApiError(404, "Resource Not Found");
  }

  static internal(message: string, error: Error | unknown) {
    return new ApiError(500, `Internal Server Error - ${message}`, error);
  }
}
