import { fetchInventory } from '@/api/inventory';

export const getInventory = async () => {
  const response = await fetchInventory();
  if (response.success) {
    return response.data;
  } else {
    throw new Error(response.error);
  }
};