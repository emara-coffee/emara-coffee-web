"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { clearTargetChatUser } from '@/store/slices/chatSlice';
import { MessageSquare, Send, User, Shield, Megaphone, Search, Users } from 'lucide-react';
import { initiateSocketConnection, getSocket, disconnectSocket } from '@/api/socket/socketService';
import { getMyConversations, getChatHistory, updateMessageStatus } from '@/api/shared/chat';

export default function AdminChatPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { targetChatUser } = useSelector((state: RootState) => state.chat);

  const [conversations, setConversations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeContact, setActiveContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const PINNED_CONTACTS = [
    {
      contactId: 'BULK_USER',
      displayName: 'Broadcast to All Customers',
      role: 'SYSTEM_BULK',
      targetRole: 'USER',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-emerald-100 text-emerald-600',
      unreadCount: 0
    },
    {
      contactId: 'BULK_DEALER',
      displayName: 'Broadcast to All Dealers',
      role: 'SYSTEM_BULK',
      targetRole: 'DEALER',
      icon: <Megaphone className="w-5 h-5" />,
      color: 'bg-amber-100 text-amber-600',
      unreadCount: 0
    }
  ];

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    fetchConversations();
    initiateSocketConnection();

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, user, router]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const res = await getMyConversations();

      let fetchedConversations = res.data || [];
      let targetContact = activeContact;

      if (targetChatUser) {
        targetContact = targetChatUser;
        setActiveContact(targetContact);
        dispatch(clearTargetChatUser());
      }

      if (targetContact && targetContact.role !== 'SYSTEM_BULK') {
        const exists = fetchedConversations.find((c: any) => c.contactId === targetContact.contactId);
        if (!exists) {
          fetchedConversations = [targetContact, ...fetchedConversations];
        }
      }

      setConversations(fetchedConversations);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const socket = getSocket();

    if (socket) {
      const handleNewMessage = (msg: any) => {
        if (activeContact && (msg.senderId === activeContact.contactId || msg.receiverId === activeContact.contactId)) {
          setMessages(prev => [...prev, msg]);

          if (msg.senderId === activeContact.contactId) {
            socket.emit('update_message_status', {
              messageId: msg.id,
              targetUserId: activeContact.contactId,
              status: 'READ'
            });
            updateMessageStatus(msg.id, { status: 'READ' });
          }
        }
        fetchConversations();
      };

      const handleStatusUpdate = (data: any) => {
        setMessages(prev => prev.map(msg => msg.id === data.messageId ? { ...msg, deliveryStatus: data.status } : msg));
      };

      const handleBulkSent = (data: any) => {
        if (activeContact?.role === 'SYSTEM_BULK' && activeContact.targetRole === data.targetRole) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            senderId: user?.id,
            content: data.content,
            deliveryStatus: `SENT TO ${data.recipientCount} USERS`,
            createdAt: data.createdAt,
            isSystemRecord: true
          }]);
        }
      };

      socket.on('receive_chat_message', handleNewMessage);
      socket.on('message_status_updated', handleStatusUpdate);
      socket.on('bulk_message_sent', handleBulkSent);

      return () => {
        socket.off('receive_chat_message', handleNewMessage);
        socket.off('message_status_updated', handleStatusUpdate);
        socket.off('bulk_message_sent', handleBulkSent);
      };
    }
  }, [activeContact]);

  useEffect(() => {
    if (activeContact) {
      if (activeContact.role === 'SYSTEM_BULK') {
        setMessages([]);
        setIsChatLoading(false);
      } else {
        loadChatHistory(activeContact.contactId);
        const socket = getSocket();
        if (socket) {
          socket.emit('join_chat', activeContact.contactId);
        }
      }
    }
  }, [activeContact?.contactId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChatHistory = async (targetUserId: string) => {
    try {
      setIsChatLoading(true);
      const res = await getChatHistory(targetUserId, { limit: 100 });
      setMessages(res.data?.data?.reverse() || []);

      const unreadIds = res.data?.data
        ?.filter((m: any) => m.senderId === targetUserId && m.deliveryStatus !== 'READ')
        .map((m: any) => m.id) || [];

      if (unreadIds.length > 0) {
        const socket = getSocket();
        unreadIds.forEach((id: string) => {
          updateMessageStatus(id, { status: 'READ' });
          if (socket) {
            socket.emit('update_message_status', { messageId: id, targetUserId, status: 'READ' });
          }
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;

    const socket = getSocket();
    if (socket) {
      if (activeContact.role === 'SYSTEM_BULK') {
        socket.emit('send_bulk_chat', {
          targetRole: activeContact.targetRole,
          content: newMessage
        });
      } else {
        socket.emit('send_chat_message', {
          receiverId: activeContact.contactId,
          content: newMessage
        });
      }
      setNewMessage('');
    }
  };

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const lowerQuery = searchQuery.toLowerCase();
    return conversations.filter(c =>
      c.displayName.toLowerCase().includes(lowerQuery) ||
      c.role.toLowerCase().includes(lowerQuery)
    );
  }, [conversations, searchQuery]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden w-full gap-4 pb-1">
      <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
            <MessageSquare className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Direct Messages & Broadcasts</h1>
            <p className="text-slate-500 text-sm mt-1">Communicate directly with users or send bulk broadcasts</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">

        <div className="w-full lg:w-1/3 flex flex-col min-h-0 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="flex-shrink-0 p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
            <h2 className="font-bold text-slate-900">Conversations</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search name or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 bg-slate-50/20 scrollbar-hide">
            {/* {!searchQuery.trim() && (
              <div className="mb-4 pb-4 border-b border-slate-200 border-dashed space-y-2">
                {PINNED_CONTACTS.map(contact => (
                  <button
                    key={contact.contactId}
                    onClick={() => setActiveContact(contact)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all ${activeContact?.contactId === contact.contactId
                        ? 'bg-slate-900 border-slate-900 shadow-md ring-2 ring-green-500/50'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activeContact?.contactId === contact.contactId ? 'bg-slate-800 text-white' : contact.color}`}>
                        {contact.icon}
                      </div>
                      <div className="min-w-0">
                        <h3 className={`text-sm font-bold truncate ${activeContact?.contactId === contact.contactId ? 'text-white' : 'text-slate-900'}`}>{contact.displayName}</h3>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${activeContact?.contactId === contact.contactId ? 'text-slate-400' : 'text-slate-500'}`}>System Broadcast</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )} */}

            {isLoading ? (
              <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-slate-200 border-t-green-500 rounded-full animate-spin"></div></div>
            ) : filteredConversations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 pt-8">
                <MessageSquare className="w-10 h-10 mb-2" />
                <p className="text-sm font-medium">No conversations found.</p>
              </div>
            ) : (
              filteredConversations.map(contact => (
                <button
                  key={contact.contactId}
                  onClick={() => setActiveContact(contact)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${activeContact?.contactId === contact.contactId
                    ? 'bg-green-50 border-green-200 shadow-sm ring-1 ring-green-500'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${contact.role === 'DEALER' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                        {contact.role === 'DEALER' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{contact.displayName}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{contact.role}</p>
                      </div>
                    </div>
                    {contact.unreadCount > 0 && (
                      <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 shadow-sm">
                        {contact.unreadCount} New
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="w-full lg:w-2/3 flex flex-col min-h-0 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {activeContact ? (
            <>

              <div className="flex-shrink-0 p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border border-slate-200 shadow-sm ${activeContact.role === 'SYSTEM_BULK' ? activeContact.color : 'bg-white'}`}>
                    {activeContact.role === 'SYSTEM_BULK' ? activeContact.icon : activeContact.role === 'DEALER' ? <Shield className="w-6 h-6 text-indigo-500" /> : <User className="w-6 h-6 text-slate-500" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-0.5">{activeContact.displayName}</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {activeContact.role === 'SYSTEM_BULK' ? `Broadcast Mode: ${activeContact.targetRole}S` : activeContact.role}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-slate-50/50 space-y-6 scrollbar-hide relative">
                {activeContact.role === 'SYSTEM_BULK' && messages.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-sm border border-slate-200 mb-4 ${activeContact.color}`}>
                      {activeContact.icon}
                    </div>
                    <p className="text-lg font-bold text-slate-700 mb-1">Broadcast Mode</p>
                    <p className="text-sm text-slate-500 max-w-sm">
                      Messages sent here will be delivered individually to every active {activeContact.targetRole.toLowerCase()}. Their replies will appear as normal, individual direct messages in your sidebar.
                    </p>
                  </div>
                )}

                {isChatLoading ? (
                  <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-slate-200 border-t-green-500 rounded-full animate-spin"></div></div>
                ) : messages.length === 0 && activeContact.role !== 'SYSTEM_BULK' ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50">
                    <MessageSquare className="w-12 h-12 mb-3" />
                    <p className="text-sm font-medium">Start the conversation</p>
                  </div>
                ) : (
                  <div className="relative z-10 space-y-6">
                    {messages.map((msg, idx) => {
                      const isMe = msg.senderId === user?.id || msg.isSystemRecord;

                      return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.isSystemRecord ? 'bg-slate-900 text-white' :
                              isMe ? 'bg-green-500 text-white' :
                                'bg-white border border-slate-200 text-slate-600'
                              }`}>
                              {msg.isSystemRecord ? <Megaphone className="w-4 h-4" /> : isMe ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            </div>

                            <div className={`p-4 rounded-2xl text-sm shadow-sm flex flex-col ${msg.isSystemRecord ? 'bg-slate-800 text-white rounded-br-sm' :
                              isMe ? 'bg-green-500 text-white rounded-br-sm' :
                                'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'
                              }`}>
                              <p className="whitespace-pre-wrap leading-relaxed break-words">{msg.content}</p>
                              <div className={`flex items-center gap-1.5 mt-2 justify-end`}>
                                <p className={`text-[10px] font-medium ${isMe || msg.isSystemRecord ? 'text-green-100 opacity-80' : 'text-slate-400'}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                {(isMe || msg.isSystemRecord) && (
                                  <span className={`text-[10px] uppercase font-black tracking-tighter ${msg.isSystemRecord ? 'text-emerald-400' : 'text-green-200'}`}>
                                    • {msg.deliveryStatus}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div ref={messagesEndRef} className="h-1" />
              </div>

              <div className="flex-shrink-0 p-4 bg-white border-t border-slate-100 z-10">
                <form onSubmit={handleSendMessage} className="flex gap-3 bg-slate-50 p-2 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-green-500/20 focus-within:bg-white transition-all">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={activeContact.role === 'SYSTEM_BULK' ? `Type broadcast to all ${activeContact.targetRole.toLowerCase()}s...` : "Type your message..."}
                    className="flex-1 px-4 bg-transparent text-sm outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className={`w-10 h-10 text-white rounded-full flex items-center justify-center disabled:opacity-50 transition-all shadow-md flex-shrink-0 ${activeContact.role === 'SYSTEM_BULK' ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20' : 'bg-green-500 hover:bg-green-600 shadow-green-500/20'
                      }`}
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 p-12 text-center h-full">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-6">
                <MessageSquare className="w-10 h-10 text-green-200" />
              </div>
              <p className="text-xl font-bold text-slate-700 mb-2">Emara Coffee Chat Console</p>
              <p className="text-sm max-w-sm text-slate-500 leading-relaxed">
                Select a conversation from the sidebar to begin direct communication with customers and dealers, or select a broadcast option.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}