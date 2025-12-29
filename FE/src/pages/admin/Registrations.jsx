import React, { useEffect, useState } from 'react';
import { Search, Loader2, CreditCard, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import AdminSubscriptionService from '../../service/AdminSubscriptionService';

export default function Registrations() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSubscriptions();
  }, [page]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await AdminSubscriptionService.getAllSubscriptions({ page, limit: 10 });
      if (res && res.data) {
        setSubscriptions(res.data);
        setTotalPages(res.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Safe parser for package_details (handles JSON string, object, or plain string)
  const parsePackageDetails = (details) => {
    if (!details) return { name: 'N/A', price: 0 };
    if (typeof details === 'object') return details;
    try {
      return JSON.parse(details);
    } catch {
      return { name: details, price: 0 }; // Plain string like "Premium"
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"><CheckCircle size={12} /> ACTIVE</span>;
      case 'PENDING':
        return <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"><Loader2 size={12} /> PENDING</span>;
      case 'EXPIRED':
        return <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"><AlertCircle size={12} /> EXPIRED</span>;
      case 'CANCELLED':
        return <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><XCircle size={12} /> CANCELLED</span>;
      default:
        return <span className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">{status}</span>;
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    sub.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    sub.payment_transaction_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="p-6 flex items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800/50">
        <div>
          <h2 className="text-xl font-semibold">Quản lý Đăng ký (Subscriptions)</h2>
          <p className="text-slate-500 dark:text-slate-400">Danh sách các gói đăng ký của thành viên.</p>
        </div>
        <button
          onClick={fetchSubscriptions}
          className="px-3 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Làm mới
        </button>
      </div>

      <div className="p-4">
        <div className="relative max-w-md mb-4">
          <input
            id="subscription-search"
            name="subscription-search"
            className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            placeholder="Tìm theo email, tên hoặc mã giao dịch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Tìm kiếm đăng ký"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/30 text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Người dùng</th>
                  <th className="px-4 py-3">Gói</th>
                  <th className="px-4 py-3">Thời hạn</th>
                  <th className="px-4 py-3">Mã Giao Dịch</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredSubscriptions.length > 0 ? (
                  filteredSubscriptions.map((sub) => (
                    <tr key={sub.subscription_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 dark:text-white">{sub.user?.full_name || 'N/A'}</div>
                        <div className="text-xs text-slate-500">{sub.user?.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400">
                          <CreditCard size={14} /> {parsePackageDetails(sub.package_details).name || sub.package_details}
                        </span>
                        <div className="text-xs text-slate-500">
                          {parsePackageDetails(sub.package_details).price?.toLocaleString('vi-VN') || 0} VND
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1 text-xs">
                          Start: {new Date(sub.start_date).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                          End: {new Date(sub.expiry_date).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {sub.payment_transaction_id || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(sub.status)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                      Chưa có đăng ký nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Simple Pagination */}
        <div className="flex justify-center gap-2 mt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-1">Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}
