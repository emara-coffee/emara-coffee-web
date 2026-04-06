"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { createTicket, getMyTickets, getTicketDetails, resolveMyTicket, requestCallback } from '@/api/shared/tickets';
import { initiateSocketConnection, getSocket, disconnectSocket } from '@/api/socket/socketService';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeBuoy, Plus, MessageSquare, Send, PhoneCall, CheckCircle2, Clock, User, X } from 'lucide-react';

export default function SupportPage() {
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
    if (!isAuthenticated) {
      router.push('/login?redirect=/support');
      return;
    }

    fetchTickets();
    initiateSocketConnection();

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, router]);

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 p-4 sm:p-6 lg:p-8 overflow-hidden w-full">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col lg:flex-row gap-6 min-h-0">

        <div className="w-full lg:w-1/3 flex flex-col min-h-0 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex-shrink-0 p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-green-400" /> Support Desk
            </h2>
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="p-2 bg-green-500 hover:bg-green-400 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
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
                      ? 'bg-white border-green-500 shadow-md ring-1 ring-green-500'
                      : 'bg-white border-slate-200 hover:border-slate-300'
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
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
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
              <div className="flex-shrink-0 p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">{activeTicket.subject}</h2>
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    Ticket #{activeTicket.id.slice(0, 8)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction('callback')}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-bold transition-colors"
                  >
                    <PhoneCall className="w-4 h-4" /> Request Call
                  </button>
                  {activeTicket.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleAction('resolve')}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-sm font-bold transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Resolve
                    </button>
                  )}
                </div>
              </div>

              <div ref={chatContainerRef} className="flex-1 min-h-0 overflow-y-auto p-6 bg-slate-50 space-y-6">
                {isChatLoading ? (
                  <div className="flex justify-center"><div className="w-8 h-8 border-2 border-slate-300 border-t-green-500 rounded-full animate-spin"></div></div>
                ) : (
                  messages.map((msg, idx) => {
                    const isSystem = msg.senderId === 'SYSTEM';
                    const isMe = msg.senderId === user?.id;

                    if (isSystem) {
                      return (
                        <div key={idx} className="flex justify-center my-4">
                          <span className="bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">{msg.message || msg.content}</span>
                        </div>
                      );
                    }

                    return (
                      <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-end gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isMe ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-600'}`}>
                            <User className="w-4 h-4" />
                          </div>
                          <div className={`p-4 rounded-2xl text-sm ${isMe
                              ? 'bg-green-500 text-white rounded-br-sm'
                              : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
                            }`}>
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.message || msg.content}</p>
                            <p className={`text-[10px] mt-2 font-medium ${isMe ? 'text-green-100' : 'text-slate-400'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {activeTicket.status !== 'RESOLVED' ? (
                <div className="flex-shrink-0 p-4 bg-white border-t border-slate-100">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    >
                      <Send className="w-5 h-5 ml-1" />
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
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <LifeBuoy className="w-16 h-16 mb-4 text-slate-200" />
              <p className="text-lg font-bold text-slate-700 mb-2">How can we help?</p>
              <p className="text-sm max-w-sm">Select a ticket from the sidebar to view details, or create a new ticket to get assistance from our support team.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showNewTicketModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">Create Support Ticket</h3>
                <button onClick={() => setShowNewTicketModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
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
                <div className="pt-4 border-t border-slate-100 flex gap-3">
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