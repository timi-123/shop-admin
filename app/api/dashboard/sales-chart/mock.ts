// app/api/dashboard/sales-chart/mock.ts - Enhanced mock sales data
export const mockSalesData = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 2000 },
  { name: "Apr", sales: 2780 },
  { name: "May", sales: 1890 },
  { name: "Jun", sales: 2390 },
  { name: "Jul", sales: 3490 },
  { name: "Aug", sales: 4000 },
  { name: "Sep", sales: 2500 },
  { name: "Oct", sales: 1500 },
  { name: "Nov", sales: 2800 },
  { name: "Dec", sales: 5000 }
];

// Helper function to generate random sales data if needed
export const generateMockData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map(month => ({
    name: month,
    sales: Math.floor(Math.random() * 5000) + 500
  }));
};
