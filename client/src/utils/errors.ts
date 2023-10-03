export class AppError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class TokenError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'TokenError';
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}
