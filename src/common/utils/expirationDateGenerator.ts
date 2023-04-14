export function expirationDateGenerator(): string {
  const currentDate = new Date();
  const expirationDate = new Date(currentDate.getTime() + 60 * 60 * 1000);
  return expirationDate.toISOString();
}

export function codeIsExpired(expirationDate: string) {
  const date = new Date(expirationDate);
  const currentDate = new Date();
  return currentDate > date;
}
