import React from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function Authors() {
  const data = [
    { id: 1, name: 'Nguyễn Nhật Ánh', books: 120, joined: '2010' },
    { id: 2, name: 'Tony Buổi Sáng', books: 5, joined: '2015' },
    { id: 3, name: 'Tô Hoài', books: 30, joined: '1990' }
  ];

  return (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="p-6 flex items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800/50">
        <div>
          <h2 className="text-xl font-semibold">Quản lý Tác giả</h2>
          <p className="text-slate-500 dark:text-slate-400">Thông tin và quản trị tác giả.</p>
        </div>
        <button className="px-3 py-2 text-sm rounded-md bg-primary text-white flex items-center gap-2">
          <Plus size={16} />
          Thêm tác giả
        </button>
      </div>

      <div className="p-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/30 text-xs uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Số đầu sách</th>
              <th className="px-4 py-3">Tham gia</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {data.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{a.name}</td>
                <td className="px-4 py-3">{a.books}</td>
                <td className="px-4 py-3">{a.joined}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Sửa">
                      <Pencil size={16} />
                    </button>
                    <button className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400" aria-label="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
