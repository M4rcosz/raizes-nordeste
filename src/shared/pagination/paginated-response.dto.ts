import { CursorPaginationMeta } from './pagination';

/**
 * HTTP response envelope for cursor-paginated lists.
 * Used by every controller that returns a paginated collection,
 * keeping the JSON shape consistent across the API.
 */
export class PaginatedResponseDto<T> {
  constructor(
    public readonly data: T[],
    public readonly meta: CursorPaginationMeta,
  ) {}
}
