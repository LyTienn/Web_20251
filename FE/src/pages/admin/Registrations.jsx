import React, { useEffect, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import AdminUserService from '../../service/AdminUserService';

export default function Registrations() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch newest users (limit 50 for example)
      const res = await AdminUserService.getAllUsers({ page: 1, limit: 50 });
      if (res && res.data && res.data.users) {
        setUsers(res.data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="p-6 flex items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800/50">
        <div>
          <h2 className="text-xl font-semibold">Thành viên mới</h2>
          <p className="text-slate-500 dark:text-slate-400">Danh sách thành viên mới đăng ký gần đây.</p>
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          {users.length} thành viên
        </span>
      </div>

      <div className="p-4">
        <div className="relative max-w-md mb-4">
          <input
            className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            placeholder="Tìm thành viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                  <th className="px-4 py-3">Tên</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">Ngày đăng ký</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.user_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{user.full_name || 'N/A'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full border ${user.role === 'ADMIN'
                            ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
                            : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                          }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                      Không tìm thấy thành viên nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
