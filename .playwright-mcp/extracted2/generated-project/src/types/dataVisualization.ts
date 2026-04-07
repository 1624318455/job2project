export interface ChartData {
  name: string;
  value: number;
}

export interface PageResult {
  data: ChartData[];
  total: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
}