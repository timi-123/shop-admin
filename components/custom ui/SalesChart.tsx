// components/custom ui/SalesChart.tsx - Enhanced with better error handling and visualization
"use client"

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { useState, useEffect } from 'react'

const SalesChart = ({ data }: { data: any[] }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Handle empty or invalid data
      if (!data || !Array.isArray(data) || data.length === 0) {
        setError("No sales data available");
        return;
      }

      // Check if data has the required format
      const hasValidFormat = data.every(item => 
        typeof item === 'object' && item !== null && 
        'name' in item && 
        ('sales' in item || 'value' in item || 'amount' in item));
      
      if (!hasValidFormat) {
        console.error('Invalid data format for SalesChart:', data);
        setError("Invalid sales data format");
        return;
      }

      // Normalize the data to ensure it has a 'sales' property
      const normalizedData = data.map(item => {
        if ('sales' in item) return item;
        if ('value' in item) return { ...item, sales: item.value };
        if ('amount' in item) return { ...item, sales: item.amount };
        return { ...item, sales: 0 };
      });
      
      setChartData(normalizedData);
      setError(null);
    } catch (err) {
      console.error("Error processing sales chart data:", err);
      setError("Error processing sales data");
    }
  }, [data]);
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-[300px] text-gray-500">
        {error}
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart 
        className='w-full h-full' 
        data={chartData} 
        margin={{ top: 5, right: 30, bottom: 5, left: 20 }}
      >
        <Line 
          type="monotone" 
          dataKey="sales" 
          stroke="#8884d8" 
          strokeWidth={2}
          dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4 }}
          activeDot={{ stroke: '#8884d8', strokeWidth: 2, r: 6 }}
        />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }}
          padding={{ left: 10, right: 10 }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `$${value.toLocaleString()}`} 
        />
        <Tooltip 
          formatter={(value: any) => [`$${value.toLocaleString()}`, 'Sales']}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Legend />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default SalesChart