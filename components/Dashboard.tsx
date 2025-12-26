import React, { useMemo } from 'react';
import { Sale, Language, Expense } from '../types';
import { TRANSLATIONS } from '../constants';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, AlertTriangle, UserMinus, Download, CreditCard } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

interface DashboardProps {
  sales: Sale[]; // We might ignore this prop now in favor of direct DB access for realtime updates, but keeping for compatibility
  lang: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  
  // Realtime Data Hooks
  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  const sales = useLiveQuery(() => db.sales.toArray(), []) || [];
  const expenses = useLiveQuery(() => db.expenses.toArray(), []) || [];

  // Calculate stats
  const stats = useMemo(() => {
    const totalSales = sales.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalDue = sales.reduce((acc, curr) => acc + (curr.dueAmount || 0), 0);
    const lowStockCount = products.filter(p => p.stock < 10).length;
    
    // Profit Calculation
    const grossProfit = sales.reduce((acc, curr) => acc + curr.totalProfit, 0);
    const totalExp = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netProfit = grossProfit - totalExp;

    return { totalSales, totalProfit: netProfit, count: sales.length, lowStockCount, totalDue, totalExpenses: totalExp };
  }, [sales, products, expenses]);

  // Prepare Chart Data (Group by Date)
  const chartData = useMemo(() => {
    const data: any = {};
    sales.forEach(sale => {
      const date = new Date(sale.date).toLocaleDateString('en-US', { weekday: 'short' });
      if (!data[date]) data[date] = { name: date, sales: 0, profit: 0 };
      data[date].sales += sale.totalAmount;
      data[date].profit += sale.totalProfit; // Showing Gross Profit trend
    });
    return Object.values(data).slice(-7); // Last 7 days/entries
  }, [sales]);

  // Generate Monthly Report CSV
  const downloadReport = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Filter data for current month
    const monthlySales = sales.filter(s => {
        const d = new Date(s.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const monthlyExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Calculate Summary
    const totalSales = monthlySales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalDue = monthlySales.reduce((acc, s) => acc + s.dueAmount, 0);
    const totalProfit = monthlySales.reduce((acc, s) => acc + s.totalProfit, 0); // Gross
    const totalExp = monthlyExpenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = totalProfit - totalExp;

    // Create CSV Content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "MONTHLY REPORT\n";
    csvContent += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    csvContent += "SUMMARY\n";
    csvContent += `Total Sales,${totalSales}\n`;
    csvContent += `Total Due,${totalDue}\n`;
    csvContent += `Total Expenses,${totalExp}\n`;
    csvContent += `Net Profit,${netProfit}\n\n`;

    csvContent += "SALES DETAIL\n";
    csvContent += "Date,Invoice ID,Total,Due,Profit\n";
    monthlySales.forEach(s => {
        csvContent += `${new Date(s.date).toLocaleDateString()},${s.id},${s.totalAmount},${s.dueAmount},${s.totalProfit}\n`;
    });

    csvContent += "\nEXPENSES DETAIL\n";
    csvContent += "Date,Description,Category,Amount\n";
    monthlyExpenses.forEach(e => {
        csvContent += `${new Date(e.date).toLocaleDateString()},${e.description},${e.category},${e.amount}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Report_${currentYear}_${currentMonth + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold text-gray-800">{t.dashboard}</h2>
         <button onClick={downloadReport} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition">
             <Download size={18} /> {t.downloadReport}
         </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500">{t.totalSales}</p>
            <p className="text-lg font-bold text-gray-800">৳{stats.totalSales.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
          <div className="p-3 bg-red-100 text-red-600 rounded-full">
            <UserMinus size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500">{t.totalDue}</p>
            <p className="text-lg font-bold text-gray-800">৳{stats.totalDue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-full">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500">{t.totalExpenses}</p>
            <p className="text-lg font-bold text-gray-800">৳{stats.totalExpenses.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500">{t.netProfit}</p>
            <p className="text-lg font-bold text-gray-800">৳{stats.totalProfit.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <ShoppingBag size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500">{t.totalOrders}</p>
            <p className="text-lg font-bold text-gray-800">{stats.count}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500">{t.lowStock}</p>
            <p className="text-lg font-bold text-gray-800">{stats.lowStockCount}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">{t.totalSales} (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `৳${value}`} />
              <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Gross Profit (Trend)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `৳${value}`} />
              <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;