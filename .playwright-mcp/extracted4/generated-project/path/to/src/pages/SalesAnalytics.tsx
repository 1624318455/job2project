import React, { useState, useEffect } from 'react';
import { getSalesData } from '@/services/salesService';
import { LineChart } from '@/components/Charts';

const SalesAnalytics: React.FC = () => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getSalesData('monthly');
        setSalesData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!salesData.length) return <div>No data available.</div>;

  return (
    <div>
      <h1>Sales Analytics</h1>
      <LineChart data={salesData} />
    </div>
  );
};

export default SalesAnalytics;