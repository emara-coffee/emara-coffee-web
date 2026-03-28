'use client';

import { BarChart3, Download, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminReports() {
  const reportData = [
    { month: 'Jan', revenue: 4500, orders: 120 },
    { month: 'Feb', revenue: 5200, orders: 145 },
    { month: 'Mar', revenue: 4800, orders: 132 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2B160A]">Performance Reports</h1>
          <p className="text-sm text-gray-500">Analyze your sales and customer growth metrics.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#2B160A] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#E67E22] transition-colors">
          <Download className="w-4 h-4" /> Download CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Monthly Conversion</p>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-bold text-[#2B160A]">3.2%</h3>
            <span className="text-emerald-500 text-xs font-bold flex items-center mb-1">
              <ArrowUpRight className="w-3 h-3" /> 0.4%
            </span>
          </div>
        </div>
        {/* Add more metric cards as needed */}
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-[#2B160A] mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#E67E22]" /> Sales Volume Over Time
        </h3>
        <div className="h-64 flex items-end gap-4 px-4 border-b border-l border-gray-100">
          {reportData.map((data) => (
            <div key={data.month} className="flex-1 flex flex-col items-center gap-2 group">
              <div 
                className="w-full bg-orange-100 group-hover:bg-[#E67E22] transition-colors rounded-t-lg" 
                style={{ height: `${(data.revenue / 6000) * 100}%` }}
              />
              <span className="text-xs font-bold text-gray-400">{data.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}