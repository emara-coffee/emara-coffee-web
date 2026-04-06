"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { setTargetChatUser } from '@/store/slices/chatSlice';
import {
  UserCircle, Search, ShieldAlert, Bell, X,
  CheckCircle, XCircle, Mail, AlertCircle, RefreshCw,
  Trash2, ChevronLeft, ChevronRight, Eye, MessageSquare
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  getPaginatedUsers,
  getUserDetails,
  updateUserStatus,
  sendCustomNotification,
  sendBulkNotification,
  hardDeleteUser
} from '@/api/admin/userManagement';
import { initializeChat } from '@/api/shared/chat';

export default function AdminCustomersPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [users, setUsers] = useState<any[]>([]);
  const [meta, setMeta] = useState({ totalCount: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusFormData, setStatusFormData] = useState({ status: 'ACTIVE' });
  const [statusLoading, setStatusLoading] = useState(false);

  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyMode, setNotifyMode] = useState<'SINGLE' | 'BULK'>('SINGLE');
  const [notifyFormData, setNotifyFormData] = useState({ title: '', message: '' });
  const [notifyLoading, setNotifyLoading] = useState(false);

  const [error, setError] = useState('');

  const fetchUsers = async (currentPage = 1) => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: 10 };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;

      const res = await getPaginatedUsers(params);
      setUsers(res.data?.data || []);
      setMeta(res.data?.meta || { totalCount: 0, totalPages: 1, currentPage, limit: 10 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(page), 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, page]);

  const handleOpenDetails = async (user: any) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
    setDetailsLoading(true);
    setError('');
    try {
      const res = await getUserDetails(user.id);
      setUserDetails(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch user details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleOpenStatus = (user: any) => {
    setSelectedUser(user);
    setStatusFormData({ status: user.status });
    setIsStatusModalOpen(true);
    setError('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusLoading(true);
    setError('');
    try {
      await updateUserStatus(selectedUser.id, statusFormData);
      setIsStatusModalOpen(false);
      fetchUsers(meta.currentPage);
      if (isDetailsModalOpen) {
        handleOpenDetails(selectedUser);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleOpenNotify = (mode: 'SINGLE' | 'BULK', user?: any) => {
    setNotifyMode(mode);
    if (mode === 'SINGLE' && user) {
      setSelectedUser(user);
    } else {
      setSelectedUser(null);
    }
    setNotifyFormData({ title: '', message: '' });
    setIsNotifyModalOpen(true);
    setError('');
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifyLoading(true);
    setError('');
    try {
      if (notifyMode === 'SINGLE') {
        await sendCustomNotification(selectedUser.id, notifyFormData);
      } else {
        await sendBulkNotification(notifyFormData);
      }
      setIsNotifyModalOpen(false);
      alert('Notification sent successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setNotifyLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this customer? This action will fail if they have an order history.')) return;
    try {
      await hardDeleteUser(id);
      fetchUsers(meta.currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  const handleStartChat = async (user: any) => {
    try {
      const res = await initializeChat({ targetUserId: user.id });
      dispatch(setTargetChatUser(res.data));
      router.push('/admin/chat');
    } catch (err) {
      alert('Failed to initialize conversation');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
            <UserCircle className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Customer Management</h1>
            <p className="text-slate-500 text-sm mt-1">Manage user accounts, privileges, and notifications</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenNotify('BULK')}
          className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
        >
          <Bell className="w-5 h-5" /> Bulk Notify Active Users
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search customers by email..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium text-slate-700"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none font-medium text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED_PURCHASES">Suspended (Purchases)</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-6">Account Info</th>
                <th className="p-6">Registration Date</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-6"><div className="h-4 bg-slate-200 rounded w-48 mb-2"></div><div className="h-3 bg-slate-100 rounded w-32"></div></td>
                    <td className="p-6"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="p-6"><div className="h-6 bg-slate-200 rounded-full w-24"></div></td>
                    <td className="p-6"><div className="h-8 bg-slate-200 rounded w-32 ml-auto"></div></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-500">
                    <UserCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium text-lg text-slate-900 mb-1">No customers found</p>
                    <p>Try adjusting your search criteria.</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={user.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-6">
                      <p className="font-bold text-slate-900">{user.email}</p>
                      <p className="text-xs text-slate-500 mt-1 font-mono">{user.id.slice(0, 8)}...</p>
                    </td>
                    <td className="p-6">
                      <span className="text-sm font-medium text-slate-700">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' :
                          user.status === 'BLOCKED' ? 'bg-rose-50 text-rose-700' :
                            'bg-amber-50 text-amber-700'
                        }`}>
                        {user.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {user.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleStartChat(user)}
                          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Message User"
                        >
                          <MessageSquare className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleOpenDetails(user)}
                          className="p-2 text-slate-400 hover:text-green-600 transition-colors"
                          title="View Profile & Stats"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleOpenNotify('SINGLE', user)}
                          className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                          title="Send Notification"
                        >
                          <Mail className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleOpenStatus(user)}
                          className="p-2 text-slate-400 hover:text-amber-600 transition-colors"
                          title="Manage Status"
                        >
                          <ShieldAlert className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Hard Delete User"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-sm font-medium text-slate-500">
              Showing page {meta.currentPage} of {meta.totalPages} ({meta.totalCount} total)
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.currentPage === 1} className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={meta.currentPage === meta.totalPages} className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isDetailsModalOpen && userDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <UserCircle className="w-6 h-6 text-green-500" /> Customer Profile
                  </h2>
                </div>
                <button onClick={() => setIsDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-8">
                {detailsLoading ? (
                  <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-slate-200 border-t-green-500 rounded-full animate-spin"></div></div>
                ) : (
                  <>
                    {error && <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-sm font-medium mb-6">{error}</div>}

                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex items-center gap-6">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-green-100 shadow-sm">
                        <UserCircle className="w-10 h-10 text-green-500" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900">{userDetails.user.email}</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`px-2.5 py-1 rounded text-xs font-bold ${userDetails.user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                            {userDetails.user.status}
                          </span>
                          <span className="text-sm font-medium text-slate-500">
                            Member since: {new Date(userDetails.user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Total Orders</p>
                        <p className="text-3xl font-black text-slate-900">{userDetails.stats.orderCount}</p>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Lifetime Value</p>
                        <p className="text-3xl font-black text-green-600">₹{(userDetails.stats.totalSpent || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Metadata Profile</h3>
                      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                        {userDetails.user.metadata && Object.keys(userDetails.user.metadata).length > 0 ? (
                          <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap">
                            {JSON.stringify(userDetails.user.metadata, null, 2)}
                          </pre>
                        ) : (
                          <p className="text-sm text-slate-500 italic">No additional metadata available for this user.</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isStatusModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-black text-slate-900">Manage Account Status</h2>
                <button onClick={() => setIsStatusModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleUpdateStatus} className="p-6 space-y-5">
                {error && <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-sm font-medium">{error}</div>}
                <div>
                  <p className="text-sm text-slate-500 mb-4">Updating status for: <span className="font-bold text-slate-900">{selectedUser.email}</span></p>
                  <label className="block text-sm font-bold text-slate-700 mb-1">New Status</label>
                  <select value={statusFormData.status} onChange={e => setStatusFormData({ ...statusFormData, status: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED_PURCHASES">SUSPEND PURCHASES</option>
                    <option value="BLOCKED">BLOCKED (Full Suspension)</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsStatusModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
                  <button type="submit" disabled={statusLoading} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold flex justify-center items-center disabled:opacity-50">
                    {statusLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Update Status'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNotifyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-500" />
                  {notifyMode === 'BULK' ? 'Send Bulk Notification' : 'Send Notification'}
                </h2>
                <button onClick={() => setIsNotifyModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSendNotification} className="p-6 space-y-5">
                {error && <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-sm font-medium">{error}</div>}

                {notifyMode === 'SINGLE' && selectedUser && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-sm font-bold text-slate-700">Recipient:</p>
                    <p className="text-sm text-slate-500">{selectedUser.email}</p>
                  </div>
                )}

                {notifyMode === 'BULK' && (
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <p className="text-sm text-indigo-800 font-medium">
                      This notification will be sent to <strong>ALL ACTIVE</strong> customers. Proceed with caution.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Notification Title</label>
                  <input required type="text" value={notifyFormData.title} onChange={e => setNotifyFormData({ ...notifyFormData, title: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" placeholder="e.g., Important Account Update" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Message Body</label>
                  <textarea required rows={4} value={notifyFormData.message} onChange={e => setNotifyFormData({ ...notifyFormData, message: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none" placeholder="Type your message here..." />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsNotifyModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={notifyLoading} className="flex-1 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors flex justify-center items-center disabled:opacity-50">
                    {notifyLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Send Notification'}
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