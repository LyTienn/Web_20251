import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Star, Loader2, Trash2, Bot, Settings2, RefreshCw } from 'lucide-react';
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
  },
  updateStatus: async (id, status) => {
    return await axiosInstance.patch(`/comments/${id}/status`, { status });
  },
  bulkCheck: async () => {
    return await axiosInstance.post(`/comments/bulk-check-pending`);
  },
  bulkApprove: async () => {
    return await axiosInstance.post(`/comments/bulk-approve`);
  },
  bulkReject: async () => {
    return await axiosInstance.post(`/comments/bulk-reject`);
  },
  bulkClassify: async () => {
    return await axiosInstance.post(`/comments/bulk-classify`);
  },
  getMode: async () => {
    return await axiosInstance.get(`/comments/moderation-mode`);
  },
  updateMode: async (mode) => {
    return await axiosInstance.put(`/comments/moderation-mode`, { mode });
  }
};

export default function CommentsModeration() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterSentiment, setFilterSentiment] = useState('');
  const [moderationMode, setModerationMode] = useState('DEFAULT');

  useEffect(() => {
    fetchComments();
    fetchMode();
  }, [filterStatus, filterSentiment]);

  const fetchMode = async () => {
    try {
      const res = await AdminCommentService.getMode();
      setModerationMode(res?.mode || 'DEFAULT');
    } catch (error) {
      console.error("Failed to fetch mode", error);
    }
  };

  const updateMode = async (newMode) => {
    try {
      await AdminCommentService.updateMode(newMode);
      setModerationMode(newMode);
      const modeName = newMode === 'AI_AUTO' ? 'AI Tự Duyệt' : newMode === 'AUTO_APPROVE' ? 'Tự Động Duyệt Tất Cả' : 'Thủ công (Mặc định)';
      alert(`Đã chuyển sang chế độ: ${modeName}`);
    } catch (error) {
      alert("Lỗi cập nhật chế độ");
    }
  };

  const handleBulkCheck = async () => {
    try {
      setLoading(true);
      const res = await AdminCommentService.bulkCheck();
      const processed = res?.data?.data?.processed ?? res?.data?.processed ?? 0;
      const spamDetected = res?.data?.data?.spamDetected ?? res?.data?.spamDetected ?? 0;
      alert(`Đã kiểm tra xong. ${processed} bình luận đã được xử lý. Phát hiện ${spamDetected} spam.`);
      fetchComments();
    } catch (error) {
      console.error("Bulk check error:", error);
      alert(`Lỗi khi chạy AI kiểm tra: ${error?.response?.data?.message || error.message}`);
      setLoading(false);
    }
  };

  const handleBulkClassify = async () => {
    try {
      setLoading(true);
      const res = await AdminCommentService.bulkClassify();
      const processed = res?.data?.data?.processed ?? res?.data?.processed ?? 0;
      alert(`Đã phân loại xong. ${processed} bình luận đã được cập nhật cảm xúc.`);
      fetchComments();
    } catch (error) {
      console.error("Bulk classify error:", error);
      alert(`Lỗi khi chạy AI phân loại: ${error?.response?.data?.message || error.message}`);
      setLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (window.confirm("Duyệt tất cả các bình luận đang chờ?")) {
      try {
        setLoading(true);
        await AdminCommentService.bulkApprove();
        alert("Đã duyệt tất cả bình luận chờ!");
        fetchComments();
      } catch (error) {
        alert("Lỗi khi duyệt tất cả");
        setLoading(false);
      }
    }
  };

  const handleBulkReject = async () => {
    if (window.confirm("Từ chối tất cả các bình luận đang chờ?")) {
      try {
        setLoading(true);
        await AdminCommentService.bulkReject();
        alert("Đã từ chối tất cả bình luận chờ!");
        fetchComments();
      } catch (error) {
        alert("Lỗi khi từ chối tất cả");
        setLoading(false);
      }
    }
  };

  const handleChangeStatus = async (id, newStatus) => {
    try {
      await AdminCommentService.updateStatus(id, newStatus);
      // Optimistic update or refresh
      fetchComments();
    } catch (error) {
      alert("Lỗi thay đổi trạng thái");
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await AdminCommentService.getAllComments({ limit: 50, status: filterStatus, sentiment: filterSentiment });
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
      <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex flex-col gap-4 flex-shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Quản lý Bình luận
              <span className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded">
                {comments.length}
              </span>
            </h2>
            <div className="flex gap-2 mt-2">
              <select
                id="filter-status"
                name="filter-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2 py-1 text-xs font-bold rounded bg-slate-100 dark:bg-slate-800 border-none outline-none"
                aria-label="Lọc theo trạng thái"
              >
                <option value="">Tất cả</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Đã từ chối</option>
              </select>
              <select
                id="filter-sentiment"
                name="filter-sentiment"
                className="px-2 py-1 text-xs font-bold rounded bg-slate-100 dark:bg-slate-800 border-none outline-none"
                value={filterSentiment}
                onChange={(e) => setFilterSentiment(e.target.value)}
                aria-label="Lọc theo cảm xúc"
              >
                <option value="">Tất cả cảm xúc</option>
                <option value="POSITIVE">Tích cực</option>
                <option value="NEUTRAL">Bình thường</option>
                <option value="NEGATIVE">Tiêu cực</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-medium px-2 flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <Settings2 size={14} /> Chế độ:
              </span>
              <button
                onClick={() => updateMode('DEFAULT')}
                className={`px-3 py-1 text-xs rounded transition-all ${moderationMode === 'DEFAULT' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Thủ công
              </button>
              <button
                onClick={() => updateMode('AI_AUTO')}
                className={`px-3 py-1 text-xs rounded transition-all flex items-center gap-1 ${moderationMode === 'AI_AUTO' ? 'bg-purple-100 text-purple-700 font-bold' : 'text-slate-500 hover:text-purple-700'}`}
              >
                <Bot size={14} /> AI Tự duyệt
              </button>
              <button
                onClick={() => updateMode('AUTO_APPROVE')}
                className={`px-3 py-1 text-xs rounded transition-all flex items-center gap-1 ${moderationMode === 'AUTO_APPROVE' ? 'bg-green-100 text-green-700 font-bold' : 'text-slate-500 hover:text-green-700'}`}
              >
                <CheckCircle2 size={14} /> Duyệt tất cả
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleBulkCheck}
                disabled={loading || comments.length === 0}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-pink-600 text-white hover:bg-pink-700 flex items-center gap-1 shadow-sm disabled:opacity-50"
                title="Kiểm tra Spam"
              >
                <Bot size={14} /> AI Check
              </button>
              <button
                onClick={handleBulkClassify}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1 shadow-sm disabled:opacity-50"
                title="Chỉ phân loại cảm xúc (không đổi trạng thái)"
              >
                <Bot size={14} /> AI Phân Loại
              </button>
              <button
                onClick={handleBulkApprove}
                disabled={loading || comments.length === 0}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-1 shadow-sm disabled:opacity-50"
              >
                <CheckCircle2 size={14} /> Duyệt Tất Cả
              </button>
              <button
                onClick={handleBulkReject}
                disabled={loading || comments.length === 0}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center gap-1 shadow-sm disabled:opacity-50"
              >
                <XCircle size={14} /> Từ Chối Tất Cả
              </button>
            </div>
          </div>
        </div>
      </div >
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
            {c.sentiment && (
              <div className="mt-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${c.sentiment === 'POSITIVE' ? 'bg-green-50 text-green-600 border-green-200' :
                  c.sentiment === 'NEGATIVE' ? 'bg-red-50 text-red-600 border-red-200' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                  {c.sentiment}
                </span>
              </div>
            )}
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
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${c.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {c.status}
                    </span>
                    <button
                      onClick={() => handleChangeStatus(c.comment_id, c.status === 'APPROVED' ? 'REJECTED' : 'APPROVED')}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500"
                      title={c.status === 'APPROVED' ? "Chuyển thành Từ chối" : "Chuyển thành Đã duyệt"}
                    >
                      <RefreshCw size={14} />
                    </button>
                    <button
                      onClick={() => handleChangeStatus(c.comment_id, 'PENDING')}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500"
                      title="Chuyển về Chờ duyệt"
                    >
                      <Loader2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div >
  );
}
