"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { motion } from 'framer-motion';
import {
  LifeBuoy, MessageSquare, Send, PhoneCall, CheckCircle2,
  Clock, User, XCircle, Shield, ChevronLeft, ChevronRight
} from 'lucide-react';
import axiosInstance from '@/api/axiosInstance';
import { initiateSocketConnection, getSocket, disconnectSocket } from '@/api/socket/socketService';

export const getAllTickets = async (params?: any) => axiosInstance.get('/api/admin/ticket-management', { params });
export const updateTicketStatus = async (ticketId: string, data: any) => axiosInstance.patch(`/api/admin/ticket-management/${ticketId}/status`, data);
export const getTicketDetails = async (ticketId: string, params?: any) => axiosInstance.get(`/api/shared/tickets/${ticketId}`, { params });

export default function AdminSupportPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [tickets, setTickets] = useState<any[]>([]);
  const [meta, setMeta] = useState({ totalCount: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    initiateSocketConnection();
    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, user, router]);

  const fetchTickets = async (currentPage = 1) => {
    try {
      setIsLoading(true);
      const params: any = { page: currentPage, limit: 10 };
      if (statusFilter) params.status = statusFilter;

      const res = await getAllTickets(params);
      setTickets(res.data?.data || []);
      setMeta(res.data?.meta || { totalCount: 0, totalPages: 1, currentPage, limit: 10 });

      if (res.data?.data?.length > 0 && !activeTicket) {
        setActiveTicket(res.data.data[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchTickets(page), 300);
    return () => clearTimeout(timer);
  }, [statusFilter, page]);

  useEffect(() => {
    const socket = getSocket();

    if (socket) {
      const handleNewMessage = (msg: any) => {
        if (activeTicket && msg.ticketId === activeTicket.id) {
          setMessages(prev => [...prev, msg]);
        }
      };

      socket.on('ticketMessage', handleNewMessage);

      return () => {
        socket.off('ticketMessage', handleNewMessage);
      };
    }
  }, [activeTicket]);

  useEffect(() => {
    if (activeTicket) {
      loadTicketDetails(activeTicket.id);

      const socket = getSocket();
      if (socket) {
        socket.emit('joinTicket', activeTicket.id);
      }
    }
  }, [activeTicket?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadTicketDetails = async (ticketId: string) => {
    try {
      setIsChatLoading(true);
      const res = await getTicketDetails(ticketId, { limit: 100 });
      setMessages(res.data?.messages?.reverse() || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeTicket) return;

    const socket = getSocket();
    if (socket) {
      socket.emit('sendTicketMessage', {
        ticketId: activeTicket.id,
        message: newMessage
      });
      setNewMessage('');
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!activeTicket) return;
    try {
      await updateTicketStatus(activeTicket.id, { status });
      const updatedTicket = { ...activeTicket, status };
      setActiveTicket(updatedTicket);
      setTickets(prev => prev.map(t => t.id === activeTicket.id ? updatedTicket : t));
    } catch (error) {
      console.error(error);
      alert('Failed to update ticket status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
            <LifeBuoy className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Support Desk</h1>
            <p className="text-slate-500 text-sm mt-1">Manage customer and dealer support requests</p>
          </div>
        </div>
      </div>

      <div className="h-[calc(100vh-240px)] flex flex-col lg:flex-row gap-6">

        <div className="w-full lg:w-1/3 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium text-slate-700 text-sm shadow-sm"
            >
              <option value="">All Tickets</option>
              <option value="OPEN">Open</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoading ? (
              <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-slate-200 border-t-green-500 rounded-full animate-spin"></div></div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">No support tickets found.</p>
              </div>
            ) : (
              tickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => setActiveTicket(ticket)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${activeTicket?.id === ticket.id
                      ? 'bg-green-50 border-green-200 shadow-sm ring-1 ring-green-500'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">#{ticket.id.slice(0, 8)}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ticket.status === 'OPEN' ? 'bg-amber-100 text-amber-700' :
                        ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-200 text-slate-700'
                      }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1 truncate pr-4">{ticket.subject}</h3>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
                      {ticket.creatorRole === 'DEALER' ? <Shield className="w-3 h-3 text-green-500" /> : <User className="w-3 h-3" />}
                      <span className="truncate max-w-[120px]">{ticket.creatorEmail}</span>
                    </div>
                    {ticket.callbackRequested && (
                      <span className="bg-rose-100 text-rose-600 p-1 rounded-full"><PhoneCall className="w-3 h-3" /></span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {meta.totalPages > 1 && (
            <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between flex-shrink-0">
              <p className="text-xs font-medium text-slate-500">
                Pg {meta.currentPage} of {meta.totalPages}
              </p>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.currentPage === 1} className="p-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 bg-white shadow-sm">
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={meta.currentPage === meta.totalPages} className="p-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 bg-white shadow-sm">
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-2/3 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {activeTicket ? (
            <>
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-slate-900 mb-1 truncate">{activeTicket.subject}</h2>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-medium text-slate-500 flex items-center gap-1.5">
                      {activeTicket.creatorRole === 'DEALER' ? <Shield className="w-4 h-4 text-green-500" /> : <User className="w-4 h-4 text-slate-400" />}
                      {activeTicket.creatorEmail}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-mono text-xs">{new Date(activeTicket.createdAt).toLocaleString()}</span>
                  </div>
                  {activeTicket.callbackRequested && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-lg">
                      <PhoneCall className="w-3.5 h-3.5" /> Callback Requested by User
                    </div>
                  )}
                </div>

                <div className="flex flex-shrink-0">
                  <select
                    value={activeTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`text-sm font-bold px-4 py-2.5 rounded-xl border outline-none cursor-pointer shadow-sm ${activeTicket.status === 'OPEN' ? 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-2 focus:ring-amber-500' :
                        activeTicket.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-2 focus:ring-emerald-500' :
                          'bg-slate-100 text-slate-700 border-slate-300 focus:ring-2 focus:ring-slate-500'
                      }`}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6">
                {isChatLoading ? (
                  <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-slate-200 border-t-green-500 rounded-full animate-spin"></div></div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">No messages yet.</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isSystem = msg.senderId === 'SYSTEM';
                    const isAdmin = msg.senderRole === 'ADMIN';

                    if (isSystem) {
                      return (
                        <div key={idx} className="flex justify-center my-4">
                          <span className="bg-slate-200/50 text-slate-500 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">{msg.message}</span>
                        </div>
                      );
                    }

                    return (
                      <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-end gap-2 max-w-[85%] ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${isAdmin ? 'bg-green-500 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                            {isAdmin ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                          </div>
                          <div className={`p-4 rounded-2xl text-sm shadow-sm ${isAdmin
                              ? 'bg-green-500 text-white rounded-br-sm'
                              : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'
                            }`}>
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.message || msg.content}</p>
                            <p className={`text-[10px] mt-2 font-medium ${isAdmin ? 'text-green-100' : 'text-slate-400'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {activeTicket.status === 'OPEN' ? (
                <div className="p-4 bg-white border-t border-slate-100">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a response to the user..."
                      className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-green-500/20 flex-shrink-0"
                    >
                      <Send className="w-5 h-5 ml-0.5" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center flex items-center justify-center gap-2 text-sm font-bold text-slate-500">
                  {activeTicket.status === 'RESOLVED' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-slate-400" />}
                  This ticket is marked as {activeTicket.status}. You cannot send messages.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-6">
                <LifeBuoy className="w-10 h-10 text-green-200" />
              </div>
              <p className="text-xl font-bold text-slate-700 mb-2">Support Dashboard</p>
              <p className="text-sm max-w-sm text-slate-500">Select a ticket from the list to view its details, chat history, and manage its resolution status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}