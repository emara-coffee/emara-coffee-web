'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, Send, Loader2, User, UserCheck } from 'lucide-react';
import { RootState } from '@/store/store';
import { getUserTickets, createTicket, getTicketMessages, addTicketMessage } from '@/api/tickets';

export default function TicketsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessageBody, setNewMessageBody] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const data = await getUserTickets();
      setTickets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchTickets();
  }, [isAuthenticated, router, fetchTickets]);

  const loadMessages = async (ticket: any) => {
    setSelectedTicket(ticket);
    setLoadingMessages(true);
    setIsCreating(false);
    try {
      const msgs = await getTicketMessages(ticket.id);
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTicket(true);
    try {
      await createTicket({ subject: newSubject, message: newMessageBody });
      await fetchTickets();
      setIsCreating(false);
      setNewSubject('');
      setNewMessageBody('');
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;
    setSendingReply(true);
    try {
      await addTicketMessage({ ticketId: selectedTicket.id, message: replyMessage });
      setReplyMessage('');
      const msgs = await getTicketMessages(selectedTicket.id);
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error(error);
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#E67E22]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#2B160A] mb-2">Support Tickets</h1>
          <p className="text-gray-600">Need help? Open a ticket and our team will get back to you.</p>
        </div>
        <button
          onClick={() => { setIsCreating(true); setSelectedTicket(null); }}
          className="bg-[#E67E22] text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-[#c96d1c] transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" /> New Ticket
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          {tickets.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100 flex-1 flex flex-col items-center justify-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
              <p className="font-semibold text-gray-700">No active tickets</p>
              <p className="text-sm text-gray-500">You have no support history.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1 max-h-[600px] overflow-y-auto">
              <div className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => loadMessages(ticket)}
                    className={`p-5 cursor-pointer transition-colors ${
                      selectedTicket?.id === ticket.id ? 'bg-orange-50 border-l-4 border-l-[#E67E22]' : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-bold text-sm line-clamp-1 ${selectedTicket?.id === ticket.id ? 'text-[#E67E22]' : 'text-[#2B160A]'}`}>
                        {ticket.subject}
                      </h3>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                        ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">
                      Opened: {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden max-h-[600px]">
          {isCreating ? (
            <div className="p-8 flex-1 overflow-y-auto">
              <h2 className="text-2xl font-bold text-[#2B160A] mb-6 border-b border-gray-100 pb-4">Create New Ticket</h2>
              <form onSubmit={handleCreateTicket} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                    placeholder="Briefly describe your issue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                  <textarea
                    required
                    rows={6}
                    value={newMessageBody}
                    onChange={(e) => setNewMessageBody(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                    placeholder="Please provide details..."
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submittingTicket} className="bg-[#2B160A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#E67E22] transition-colors disabled:opacity-50 flex items-center gap-2">
                    {submittingTicket ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    Submit Ticket
                  </button>
                </div>
              </form>
            </div>
          ) : selectedTicket ? (
            <>
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-[#2B160A] mb-1">{selectedTicket.subject}</h2>
                  <p className="text-xs text-gray-500">Ticket ID: {selectedTicket.id}</p>
                </div>
                <span className={`text-xs font-bold uppercase px-3 py-1.5 rounded-full ${
                  selectedTicket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                }`}>
                  {selectedTicket.status}
                </span>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto bg-white space-y-6">
                {loadingMessages ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-[#E67E22]" />
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwnMessage = msg.sender.id === user?.id;
                    return (
                      <div key={msg.id} className={`flex gap-4 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isOwnMessage ? 'bg-orange-100 text-[#E67E22]' : 'bg-[#2B160A] text-white'
                        }`}>
                          {isOwnMessage ? <User className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                        </div>
                        <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                          isOwnMessage ? 'bg-[#E67E22] text-white rounded-tr-none' : 'bg-gray-100 text-[#2B160A] rounded-tl-none'
                        }`}>
                          <div className="flex items-center gap-2 mb-1 justify-between">
                            <span className="text-xs font-bold opacity-75">
                              {isOwnMessage ? 'You' : `${msg.sender.firstName} (Support)`}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                          <p className="text-[10px] opacity-60 mt-2 text-right">
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {selectedTicket.status === 'open' ? (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <form onSubmit={handleSendReply} className="flex gap-2">
                    <input
                      type="text"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                    />
                    <button
                      type="submit"
                      disabled={sendingReply || !replyMessage.trim()}
                      className="w-12 h-12 bg-[#2B160A] text-white rounded-full flex items-center justify-center hover:bg-[#E67E22] transition-colors disabled:opacity-50"
                    >
                      {sendingReply ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 -ml-1" />}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-sm text-gray-500 font-medium">
                  This ticket has been closed.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-center p-8">
              <div>
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">Select a Ticket</h3>
                <p className="text-gray-500">Choose a ticket from the sidebar to view the conversation or create a new one.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}