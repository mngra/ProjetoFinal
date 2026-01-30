export class ApiError extends Error {
  constructor(message, { status, data, code } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.code = code;
  }
}
