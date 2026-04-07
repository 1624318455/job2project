import { ApiResponse } from '@/types';
import { request } from '@/utils/request';

export const fetchSalesData = async (type: 'daily' | 'weekly' | 'monthly'): Promise<ApiResponse> => {
  try {
    const response = await request({
      url: `/api/sales/data?type=${type}`,
      method: 'GET',
    });
    return { data: response.data, success: true };
  } catch (error) {
    return { error: error.message, success: false };
  }
};