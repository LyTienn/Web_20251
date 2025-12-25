import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Star, Loader2, Trash2 } from 'lucide-react';
import axiosInstance from '../../config/Axios-config';

// Temporary service definition if not exists, or move to separate file later.
// To save tool calls, I'll implement fetch inside the component or use axiosInstance directly.
const AdminCommentService = {
  getAllComments: async (params) => {
    const res = await axiosInstance.get('/comments', { params });
    return res?.data;
  },
  approveComment: async (id) => {
    return await axiosInstance.patch(`/comments/${id}/approve`);
  },
  rejectComment: async (id) => {
    return await axiosInstance.patch(`/comments/${id}/reject`);
  },
  deleteComment: async (id) => {
    return await axiosInstance.delete(`/comments/${id}`);
  }
};

export default function CommentsModeration() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState('PENDING');

  useEffect(() => {
    fetchComments();
  }, [filterStatus]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await AdminCommentService.getAllComments({ limit: 50, status: filterStatus });
      setComments(res?.comments || []);
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn từ chối bình luận này?")) {
      try {
        await AdminCommentService.rejectComment(id);
        setComments(comments.filter(c => c.comment_id !== id));
      } catch (error) {
        alert("Lỗi khi từ chối bình luận");
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      await AdminCommentService.approveComment(id);
      setComments(comments.filter(c => c.comment_id !== id));
    } catch (error) {
      alert("Lỗi khi duyệt bình luận");
    }
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  return (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[600px]">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-xl font-semibold">Quản lý Bình luận</h2>
          <div className="flex gap-2 mt-2">
            {['PENDING', 'APPROVED', 'REJECTED'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 text-xs font-bold rounded ${filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}
              >
                {status === 'PENDING' ? 'Chờ duyệt' : status === 'APPROVED' ? 'Đã duyệt' : 'Đã từ chối'}
              </button>
            ))}
          </div>
        </div>
        <span className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded">
          {comments.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-0">
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" size={24} /></div>
        ) : comments.length === 0 ? (
          <div className="text-center p-8 text-slate-500">Không có bình luận nào</div>
        ) : comments.map((c) => (
          <div key={c.comment_id} className="p-5 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
            <div className="flex justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-slate-900 dark:text-white">{c.user?.full_name || 'Người dùng ẩn'}</span>
                <span className="text-xs text-slate-500">• Sách: "{c.book?.title || 'Unknown'}"</span>
              </div>
              <span className="text-xs text-slate-400">{getTimeAgo(c.created_at)}</span>
            </div>
            <div className="mb-2 flex">
              {[...Array(c.rating || 0)].map((_, i) => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{c.content}</p>
            <div className="mt-3 flex gap-2">
              <div className="mt-3 flex gap-2">
                {filterStatus === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleApprove(c.comment_id)}
                      className="px-3 py-1 text-xs rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1 hover:bg-green-200"
                    >
                      <CheckCircle2 size={14} /> Duyệt
                    </button>
                    <button
                      onClick={() => handleReject(c.comment_id)}
                      className="px-3 py-1 text-xs rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 flex items-center gap-1 hover:bg-red-200"
                    >
                      <XCircle size={14} /> Từ chối
                    </button>
                  </>
                )}
                {filterStatus !== 'PENDING' && (
                  <span className={`px-2 py-1 text-xs rounded-full ${c.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {c.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
