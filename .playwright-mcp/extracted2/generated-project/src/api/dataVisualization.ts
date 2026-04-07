import type { ApiResponse, PageResult } from '@/types';

const mockData: PageResult<ChartData> = {
  list: [
    { id: '1', name: 'ECharts', value: 150, category: '可视化' },
    { id: '2', name: 'D3.js', value: 120, category: '可视化' },
    { id: '3', name: 'Three.js', value: 90, category: '3D' },
    { id: '4', name: 'C3.js', value: 70, category: '可视化' },
  ],
  total: 4,
  page: 1,
  pageSize: 10,
};

interface ChartData {
  id: string;
  name: string;
  value: number;
  category: string;
}

export const fetchDataVisualization = async (): Promise<ApiResponse<PageResult<ChartData>>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ code: 0, data: mockData, message: 'success' });
    }, 1000);
  });
};