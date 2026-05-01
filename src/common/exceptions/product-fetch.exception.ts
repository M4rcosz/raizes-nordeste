export class ProductsFetchException extends Error {
  constructor(message = 'Could not retrieve active products') {
    super(message);
    this.name = 'ProductsFetchException';
  }
}
