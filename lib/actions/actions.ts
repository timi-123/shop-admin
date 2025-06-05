// lib/actions/actions.ts - REPLACE ENTIRE FILE WITH THIS

export const getTotalSales = async () => {
  // Mock data for dashboard
  return { 
    totalOrders: 150, 
    totalRevenue: 25780.50 
  };
};

export const getTotalCustomers = async () => {
  // Mock data for dashboard
  return 87;
};

export const getSalesPerMonth = async () => {
  // Mock data for chart
  return [
    { name: 'Jan', sales: 8400 },
    { name: 'Feb', sales: 7200 },
    { name: 'Mar', sales: 9800 },
    { name: 'Apr', sales: 11200 },
    { name: 'May', sales: 10500 },
    { name: 'Jun', sales: 12800 },
    { name: 'Jul', sales: 14200 },
    { name: 'Aug', sales: 13100 },
    { name: 'Sep', sales: 11900 },
    { name: 'Oct', sales: 10300 },
    { name: 'Nov', sales: 9600 },
    { name: 'Dec', sales: 15400 }
  ];
};