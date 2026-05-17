export const ERROR_KINDS = {
  NOT_FOUND: 'not-found',
  INVALID: 'invalid',
  CONFLICT: 'conflict',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  UNAVAILABLE: 'unavailable',
} as const;

export const KIND_TO_STATUS: Record<ErrorKind, number> = {
  'not-found': 404,
  invalid: 422,
  conflict: 409,
  unauthorized: 401,
  forbidden: 403,
  unavailable: 503,
};

export type ErrorKind = (typeof ERROR_KINDS)[keyof typeof ERROR_KINDS];
