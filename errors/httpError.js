module.exports = class HttpError extends Error {
  constructor(msg, httpCode) {
    super(msg);
    this.httpCode = httpCode;
  }
}