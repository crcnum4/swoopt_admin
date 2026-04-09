export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  requestId?: string;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

export interface PaginationMeta {
  cursor: string | null;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T;
  meta: PaginationMeta;
}
