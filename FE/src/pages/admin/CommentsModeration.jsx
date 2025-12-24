import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function CommentsModeration() {
  const comments = [
    { id: 1, user: 'Phạm Đức', book: 'Đắc Nhân Tâm', time: '5 phút trước', text: 'Cuốn sách rất hữu ích!' },
    { id: 2, user: 'Ngọc Anh', book: 'Tư duy nhanh và chậm', time: '10 phút trước', text: 'Nên có thêm ví dụ minh họa.' },
    { id: 3, user: 'Minh Tâm', book: 'Lược sử thời gian', time: '15 phút trước', text: 'Khá khó nhưng thú vị.' }
  ];

  return (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Kiểm duyệt Bình luận</h2>
        <span className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 text-xs font-bold px-2 py-1 rounded">{comments.length} pending</span>
      </div>
      <div className="flex-1 overflow-y-auto max-h-[520px] p-0">
        {comments.map((c) => (
          <div key={c.id} className="p-5 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
            <div className="flex justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-slate-900 dark:text-white">{c.user}</span>
                <span className="text-xs text-slate-500">• Sách: "{c.book}"</span>
              </div>
              <span className="text-xs text-slate-400">{c.time}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{c.text}</p>
            <div className="mt-3 flex gap-2">
              <button className="px-3 py-1 text-xs rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1">
                <CheckCircle2 size={14} /> Duyệt
              </button>
              <button className="px-3 py-1 text-xs rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 flex items-center gap-1">
                <XCircle size={14} /> Từ chối
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
