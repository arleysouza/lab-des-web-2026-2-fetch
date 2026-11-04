// O Drizzle pode encapsular o erro original do PostgreSQL em `cause`.
export function isForeignKeyViolation(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  if ('code' in error && error.code === '23503') {
    return true;
  }

  return 'cause' in error && isForeignKeyViolation(error.cause);
}
