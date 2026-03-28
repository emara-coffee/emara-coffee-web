'use client';

import { TrendingUp, Package, ShoppingCart, DollarSign, Download } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { label: 'TOTAL REVENUE', value: '$24,450.80', trend: '+12.5%', isPositive: true, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'TOTAL ORDERS', value: '452', trend: '+8.1%', isPositive: true, icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'COFFEE INVENTORY', value: '1,240kg', trend: '-2.4%', isPositive: false, icon: Package, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'AVG ORDER VALUE', value: '$54.10', trend: '+4.3%', isPositive: true, icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-sm font-bold ${stat.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-[#2B160A] mb-1">{stat.value}</h3>
              <p className="text-xs font-bold text-gray-400 tracking-wider uppercase">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-[#2B160A] tracking-wider uppercase">Revenue Growth</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="w-2 h-2 rounded-full bg-[#E67E22]"></span>
              Weekly Sales
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center border-b-2 border-l-2 border-gray-100 relative">
            <svg viewBox="0 0 100 50" className="w-full h-full preserve-3d" preserveAspectRatio="none">
              <path 
                d="M0,30 Q10,40 20,30 T40,20 T60,25 T80,10 T100,20" 
                fill="none" 
                stroke="#E67E22" 
                strokeWidth="0.5"
              />
              <path 
                d="M0,30 Q10,40 20,30 T40,20 T60,25 T80,10 T100,20 L100,50 L0,50 Z" 
                fill="url(#gradient)" 
                opacity="0.2"
              />
              <defs>
                <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#E67E22" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
            {/* Y Axis Labels */}
            <div className="absolute left-[-30px] h-full flex flex-col justify-between text-xs text-gray-400 py-2">
              <span>30k</span><span>20k</span><span>10k</span><span>0</span>
            </div>
            {/* X Axis Labels */}
            <div className="absolute bottom-[-30px] w-full flex justify-between text-xs text-gray-400 px-4">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>

        {/* Global Reach Panel */}
        <div className="bg-[#2B160A] p-8 rounded-2xl shadow-sm text-white flex flex-col">
          <h3 className="font-bold tracking-wider uppercase mb-4">Global Reach</h3>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed">
            Direct shipments currently active to 14 countries this month.
          </p>
          
          <div className="space-y-6 flex-1">
            {[
              { country: 'USA', percentage: 45 },
              { country: 'GERMANY', percentage: 28 },
              { country: 'JAPAN', percentage: 15 },
              { country: 'UK', percentage: 12 },
            ].map((stat) => (
              <div key={stat.country}>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span>{stat.country}</span>
                  <span className="text-[#E67E22]">{stat.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#E67E22] rounded-full" 
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-8 bg-white text-[#2B160A] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>
    </div>
  );
}