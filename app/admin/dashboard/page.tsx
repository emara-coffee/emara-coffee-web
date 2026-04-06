"use client";

import { motion } from 'framer-motion';
import { IndianRupee, Users, PackageOpen, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    { label: 'Total Revenue', value: '₹42,50,000', icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Active Dealers', value: '124', icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Pending Orders', value: '18', icon: PackageOpen, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Low Stock Items', value: '5', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back to the administrative control panel.</p>
        </div>
        <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center">
          <TrendingUp className="h-4 w-4 mr-2 text-gray-400" />
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <button className="text-green-600 text-sm font-medium hover:text-green-700">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-sm text-gray-500">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Dealer</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-gray-50 last:border-0">
                  <td className="py-4 font-mono text-gray-900">#ORD-0921</td>
                  <td className="py-4 text-gray-600">Apex Auto Parts</td>
                  <td className="py-4 font-medium text-gray-900">₹1,24,000</td>
                  <td className="py-4">
                    <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded text-xs font-semibold">Processing</span>
                  </td>
                  <td className="py-4 text-gray-500">Today, 10:42 AM</td>
                </tr>
                <tr className="border-b border-gray-50 last:border-0">
                  <td className="py-4 font-mono text-gray-900">#ORD-0920</td>
                  <td className="py-4 text-gray-600">Kolkata Tyre Hub</td>
                  <td className="py-4 font-medium text-gray-900">₹85,500</td>
                  <td className="py-4">
                    <span className="bg-green-50 text-green-600 px-2 py-1 rounded text-xs font-semibold">Shipped</span>
                  </td>
                  <td className="py-4 text-gray-500">Yesterday, 04:15 PM</td>
                </tr>
                <tr className="border-b border-gray-50 last:border-0">
                  <td className="py-4 font-mono text-gray-900">#ORD-0919</td>
                  <td className="py-4 text-gray-600">Eastern Power Solutions</td>
                  <td className="py-4 font-medium text-gray-900">₹3,10,000</td>
                  <td className="py-4">
                    <span className="bg-green-50 text-green-600 px-2 py-1 rounded text-xs font-semibold">Delivered</span>
                  </td>
                  <td className="py-4 text-gray-500">28 Mar 2026</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Pending Approvals</h2>
          </div>
          <div className="space-y-4">
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Northern Tyres Ltd.</h4>
                  <p className="text-xs text-gray-500">Delhi, India</p>
                </div>
                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded font-medium">Pending</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-1.5 rounded-lg text-xs font-bold transition-colors">Review</button>
              </div>
            </div>
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Western Auto Care</h4>
                  <p className="text-xs text-gray-500">Mumbai, Maharashtra</p>
                </div>
                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded font-medium">Pending</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-1.5 rounded-lg text-xs font-bold transition-colors">Review</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}