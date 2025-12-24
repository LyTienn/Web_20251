import React from 'react';
import { CheckCircle2, XCircle, Search } from 'lucide-react';

export default function Registrations() {
  const data = [
    { id: 1, name: 'Phan Hữu', email: 'phu.phan@email.com', date: '20/12/2025', status: 'Pending' },
    { id: 2, name: 'Vũ Anh', email: 'anh.vu@email.com', date: '20/12/2025', status: 'Pending' },
    { id: 3, name: 'Hồ Thu', email: 'thu.ho@email.com', date: '19/12/2025', status: 'Pending' }
  ];

  return (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="p-6 flex items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800/50">
        <div>
          <h2 className="text-xl font-semibold">Quản lý Đăng ký</h2>
          <p className="text-slate-500 dark:text-slate-400">Xử lý yêu cầu đăng ký mới.</p>
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
          {data.length} pending
        </span>
      </div>

      <div className="p-4">
        <div className="relative max-w-md mb-4">
          <input className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" placeholder="Tìm yêu cầu..." />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/30 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Ngày đăng ký</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {data.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{r.name}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.email}</td>
                  <td className="px-4 py-3">{r.date}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="px-3 py-1 text-xs rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1">
                        <CheckCircle2 size={14} /> Duyệt
                      </button>
                      <button className="px-3 py-1 text-xs rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 flex items-center gap-1">
                        <XCircle size={14} /> Từ chối
                      </button>
                    </div>
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
