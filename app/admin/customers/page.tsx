'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, MessageSquare, CheckCircle } from 'lucide-react';
import { getAllTickets, updateTicketStatus } from '@/api/tickets';

export default function AdminCustomersAndTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      const data = await getAllTickets();
      setTickets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    setUpdatingId(ticketId);
    try {
      await updateTicketStatus(ticketId, newStatus);
      await fetchTickets();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tickets or customers..."
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] w-full sm:w-80"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#2B160A] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#E67E22]" /> Customer Support Tickets
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="p-4">Ticket ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Status Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#E67E22] mx-auto" />
                  </td>
                </tr>
              ) : tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <span className="font-mono text-xs font-bold text-gray-500">{ticket.id.split('-')[0]}</span>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-sm text-[#2B160A]">{ticket.user.firstName} {ticket.user.lastName}</p>
                    <p className="text-xs text-gray-500">{ticket.user.email}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-sm text-[#2B160A]">{ticket.subject}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-600 font-medium">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                      disabled={updatingId === ticket.id}
                      className={`text-xs font-bold uppercase px-3 py-1.5 rounded-full border-none focus:ring-2 focus:ring-[#E67E22] cursor-pointer outline-none ${
                        ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}