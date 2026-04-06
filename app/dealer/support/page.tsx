"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { createTicket, getMyTickets, getTicketDetails, resolveMyTicket, requestCallback } from '@/api/shared/tickets';
import { initiateSocketConnection, getSocket, disconnectSocket } from '@/api/socket/socketService';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeBuoy, Plus, MessageSquare, Send, PhoneCall, CheckCircle2, Clock, User, X } from 'lucide-react';

export default function DealerSupportPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);

  const [newTicketData, setNewTicketData] = useState({ subject: '', category: 'GENERAL', priority: 'LOW', message: '' });
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'DEALER') {
      router.push('/login?redirect=/dealer/support');
      return;
    }

    fetchTickets();
    initiateSocketConnection();

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, user, router]);

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
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await getMyTickets();
      setTickets(res.data?.data || []);
      if (res.data?.data?.length > 0 && !activeTicket) {
        setActiveTicket(res.data.data[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTicketDetails = async (ticketId: string) => {
    try {
      setIsChatLoading(true);
      const res = await getTicketDetails(ticketId);
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

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTicket({
        subject: newTicketData.subject,
        description: newTicketData.message,
        callbackRequested: false
      });
      setShowNewTicketModal(false);
      setNewTicketData({ subject: '', category: 'GENERAL', priority: 'LOW', message: '' });
      await fetchTickets();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAction = async (action: 'resolve' | 'callback') => {
    if (!activeTicket) return;
    try {
      if (action === 'resolve') {
        if (!confirm('Mark this ticket as resolved?')) return;
        await resolveMyTicket(activeTicket.id);
      } else {
        await requestCallback(activeTicket.id);
        alert('Callback requested successfully.');
      }
      await fetchTickets();
      const updatedTicket = { ...activeTicket, status: action === 'resolve' ? 'RESOLVED' : activeTicket.status };
      setActiveTicket(updatedTicket);
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading && tickets.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden w-full gap-4 pb-1">
      <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
            <LifeBuoy className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Dealer Support</h1>
            <p className="text-slate-500 text-sm mt-1">Get dedicated assistance from the Emara Coffee team</p>
          </div>
        </div>
        <button
          onClick={() => setShowNewTicketModal(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" /> New Ticket
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/3 flex flex-col min-h-0 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex-shrink-0 p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
            <h2 className="font-bold text-slate-900">My Tickets</h2>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 bg-slate-50/20 scrollbar-hide">
            {tickets.length === 0 ? (
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
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">#{ticket.id.slice(0, 6)}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ticket.status === 'OPEN' ? 'bg-amber-100 text-amber-700' :
                        ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-green-100 text-green-700'
                      }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1 truncate">{ticket.subject}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <Clock className="w-3 h-3" /> {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="w-full lg:w-2/3 flex flex-col min-h-0 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {activeTicket ? (
            <>
              <div className="flex-shrink-0 p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">{activeTicket.subject}</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    Ticket #{activeTicket.id.slice(0, 8)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction('callback')}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-colors shadow-sm"
                  >
                    <PhoneCall className="w-4 h-4" /> Request Call
                  </button>
                  {activeTicket.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleAction('resolve')}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold transition-colors shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Resolve
                    </button>
                  )}
                </div>
              </div>

              <div ref={chatContainerRef} className="flex-1 min-h-0 overflow-y-auto p-6 bg-slate-50/50 space-y-6 scrollbar-hide">
                {isChatLoading ? (
                  <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-slate-200 border-t-green-500 rounded-full animate-spin"></div></div>
                ) : (
                  messages.map((msg, idx) => {
                    const isSystem = msg.senderId === 'SYSTEM';
                    const isMe = msg.senderId === user?.id;

                    if (isSystem) {
                      return (
                        <div key={idx} className="flex justify-center my-4">
                          <span className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">{msg.message || msg.content}</span>
                        </div>
                      );
                    }

                    return (
                      <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${isMe ? 'bg-green-500 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                            <User className="w-4 h-4" />
                          </div>
                          <div className={`p-4 rounded-2xl text-sm shadow-sm flex flex-col ${isMe
                              ? 'bg-green-500 text-white rounded-br-sm'
                              : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'
                            }`}>
                            <p className="whitespace-pre-wrap leading-relaxed break-words">{msg.message || msg.content}</p>
                            <div className={`flex items-center gap-1.5 mt-2 justify-end`}>
                              <p className={`text-[10px] font-medium ${isMe ? 'text-green-100 opacity-80' : 'text-slate-400'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {activeTicket.status !== 'RESOLVED' ? (
                <div className="flex-shrink-0 p-4 bg-white border-t border-slate-100 z-10">
                  <form onSubmit={handleSendMessage} className="flex gap-3 bg-slate-50 p-2 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-green-500/20 focus-within:bg-white transition-all">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="flex-1 px-4 bg-transparent text-sm outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 disabled:opacity-50 transition-all shadow-md flex-shrink-0 shadow-green-500/20"
                    >
                      <Send className="w-4 h-4 ml-0.5" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex-shrink-0 p-4 bg-emerald-50 border-t border-emerald-100 text-center text-sm font-bold text-emerald-700">
                  This ticket has been marked as resolved.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 p-12 text-center h-full">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-6">
                <LifeBuoy className="w-10 h-10 text-green-200" />
              </div>
              <p className="text-xl font-bold text-slate-700 mb-2">How can we help?</p>
              <p className="text-sm max-w-sm text-slate-500 leading-relaxed">Select a ticket from the sidebar to view details, or create a new ticket to get assistance from our support team.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showNewTicketModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-black text-slate-900">Create Support Ticket</h3>
                <button onClick={() => setShowNewTicketModal(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateTicket} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Subject</label>
                  <input
                    type="text"
                    required
                    value={newTicketData.subject}
                    onChange={e => setNewTicketData({ ...newTicketData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Brief description of the issue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={newTicketData.message}
                    onChange={e => setNewTicketData({ ...newTicketData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none"
                    placeholder="Describe your issue in detail..."
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowNewTicketModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors">
                    Submit Ticket
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}