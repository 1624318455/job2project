import React, { useState, useEffect } from 'react';
import { getInventory } from '@/services/inventoryService';
import { Table } from '@/components/Table';

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        const data = await getInventory();
        setInventory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!inventory.length) return <div>No inventory available.</div>;

  return (
    <div>
      <h1>Inventory</h1>
      <Table data={inventory} />
    </div>
  );
};

export default Inventory;