export class ProductsFetchException extends Error {
  /**
   * Exception thrown when active products cannot be retrieved.
   *
   * This error is used to signal failures during product fetching operations,
   * typically when the application cannot load or access the active product list.
   *
   * @param [message='Could not retrieve active products'] The Error Message
   */
  constructor(message = 'Could not retrieve active products') {
    super(message);
    this.name = 'ProductsFetchException';
  }
}
