export class ServiceNotExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServiceNotExistsError';
  }
}
