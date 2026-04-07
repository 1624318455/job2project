export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
}

export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message?: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}