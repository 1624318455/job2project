import { ApiResponse } from '@/types';
import { request } from '@/utils/request';

export const fetchInventory = async (): Promise<ApiResponse> => {
  try {
    const response = await request({
      url: '/api/inventory',
      method: 'GET',
    });
    return { data: response.data, success: true };
  } catch (error) {
    return { error: error.message, success: false };
  }
};