export const UserRole = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
  KITCHEN: 'KITCHEN',
  MANAGER: 'MANAGER',
  ATTENDANT: 'ATTENDANT',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
