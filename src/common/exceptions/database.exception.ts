export class DatabaseException extends Error {
  /**
   * This is a Database Exception, when it tries to do some action but it is returned with a error.
   * @param message The Error Message
   * @param cause The Error Cause
   */
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'DatabaseException';
  }
}
