/**
 * Standard paginated response envelope returned by all list endpoints.
 *
 * Matches the Java PageResponse<T> shape:
 * {
 *   "data": [ ... ],
 *   "meta": {
 *     "page": 0,
 *     "size": 20,
 *     "totalElements": 523,
 *     "totalPages": 27,
 *     "first": true,
 *     "last": false
 *   }
 * }
 */
export interface PageMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PageResponse<T> {
  data: T[];
  meta: PageMeta;
}
