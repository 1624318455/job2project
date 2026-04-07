import { fetchSalesData } from '@/api/salesData';

export const getSalesData = async (type: 'daily' | 'weekly' | 'monthly') => {
  const response = await fetchSalesData(type);
  if (response.success) {
    return response.data;
  } else {
    throw new Error(response.error);
  }
};