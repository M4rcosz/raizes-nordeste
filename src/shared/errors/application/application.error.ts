import { ErrorKind } from '../errors.type';

export class ApplicationError extends Error {
  readonly kind: ErrorKind;

  constructor(kind: ErrorKind, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.kind = kind;
    this.name = new.target.name;
  }
}
