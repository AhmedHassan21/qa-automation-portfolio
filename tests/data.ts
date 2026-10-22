export const USERS = {
  valid: { username: 'standard_user', password: 'secret_sauce' },
  lockedOut: { username: 'locked_out_user', password: 'secret_sauce' },
} as const;

export const INVALID_LOGIN = {
  username: 'standard_user',
  password: 'wrong_password',
} as const;

export const CHECKOUT_INFO = {
  firstName: 'Ahmed',
  lastName: 'Hassan',
  postalCode: '20133',
} as const;
