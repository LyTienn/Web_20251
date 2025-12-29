import React, { useState, useEffect } from 'react';
import { Loader2, Search, BookOpen } from 'lucide-react';
import axiosInstance from '../../config/Axios-config';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = {
    POSITIVE: '#22c55e', // Green
    NEUTRAL: '#64748b',  // Slate
    NEGATIVE: '#ef4444', // Red
    UNKNOWN: '#cbd5e1'   // Light Slate
};

const BookAnalytics = () => {
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingBooks, setLoadingBooks] = useState(false);

    const [bookComments, setBookComments] = useState([]);
    const [sentimentStats, setSentimentStats] = useState(null);
    const [loadingData, setLoadingData] = useState(false);

    const [sentimentFilter, setSentimentFilter] = useState('ALL');

    useEffect(() => {
        fetchBooks();
    }, []);

    useEffect(() => {
        if (selectedBook) {
            fetchBookData(selectedBook.id, sentimentFilter);
        }
    }, [selectedBook, sentimentFilter]);

    const fetchBooks = async () => {
        try {
            setLoadingBooks(true);
            // Use new endpoint to get only books with comments
            const res = await axiosInstance.get('/comments/books-with-comments', { params: { limit: 100 } });
            setBooks(res?.data || []);
        } catch (error) {
            console.error("Error fetching books:", error);
        } finally {
            setLoadingBooks(false);
        }
    };

    const fetchBookData = async (bookId, sentiment) => {
        try {
            setLoadingData(true);

            // Fetch Comments with Sentiment Filter
            const params = { limit: 50 };
            if (sentiment !== 'ALL') {
                params.sentiment = sentiment;
            }

            const commentsRes = await axiosInstance.get(`/comments/books/${bookId}/comments`, { params });
            setBookComments(commentsRes?.data?.comments || []);

            // Fetch Sentiment Stats (only once or always? Always is fine to keep chart updated if needed, but chart usually visualizes ALL comments)
            // Ideally chart shows breakdown of ALL comments, while list shows filtered.
            // So we might not re-fetch stats if just filtering list, but for simplicity let's keep it sync or check if selectedBook changed.
            // If just filter changed, maybe don't fetch stats? 
            // Let's refactor: Fetch stats only when book changes. Fetch comments when book OR filter changes.
            if (sentiment === 'ALL' || !sentimentStats) {
                const statsRes = await axiosInstance.get('/comments/sentiment-stats', { params: { bookId } });
                setSentimentStats(statsRes?.data || null);
            }

        } catch (error) {
            console.error("Error fetching book data:", error);
        } finally {
            setLoadingData(false);
        }
    };

    const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const chartData = sentimentStats ? [
        { name: 'Tích cực', value: sentimentStats.POSITIVE, color: COLORS.POSITIVE },
        { name: 'Bình thường', value: sentimentStats.NEUTRAL, color: COLORS.NEUTRAL },
        { name: 'Tiêu cực', value: sentimentStats.NEGATIVE, color: COLORS.NEGATIVE },
    ] : [];

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] gap-6 p-6">
            <div className="flex gap-6 h-full">
                {/* Left: Book List */}
                <div className="w-1/3 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="font-bold flex items-center gap-2 mb-3">
                            <BookOpen size={18} /> Chọn Sách (Có bình luận)
                        </h2>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                            <input
                                id="book-search"
                                name="book-search"
                                type="text"
                                placeholder="Tìm kiếm sách..."
                                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                aria-label="Tìm kiếm sách"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {loadingBooks ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                        ) : filteredBooks.length > 0 ? (
                            filteredBooks.map(book => (
                                <button
                                    key={book.id}
                                    onClick={() => setSelectedBook(book)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-3 ${selectedBook?.id === book.id
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                                        }`}
                                >
                                    <img src={book.cover_image || 'https://placehold.co/40x60'} alt="" className="w-8 h-10 object-cover rounded shadow-sm" />
                                    <div className="flex-1 min-w-0">
                                        <div className="truncate font-medium">{book.title}</div>
                                        <div className="text-xs text-slate-500">{book.commentCount || 0} bình luận</div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-4 text-center text-sm text-slate-500">Không tìm thấy sách nào có bình luận.</div>
                        )}
                    </div>
                </div>

                {/* Right: Analytics & Comments */}
                <div className="w-2/3 flex flex-col gap-6">
                    {selectedBook ? (
                        <>
                            {/* Top: Sentiment Chart */}
                            <div className="h-64 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex overflow-hidden">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 truncate" title={selectedBook.title}>Phân tích Cảm Xúc: {selectedBook.title}</h3>
                                    {loadingData && !sentimentStats ? (
                                        <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>
                                    ) : sentimentStats ? (
                                        <div className="flex items-center h-full justify-center pb-6">
                                            <div className="w-[300px] h-[200px]">
                                                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                                                    <PieChart>
                                                        <Pie
                                                            data={chartData}
                                                            innerRadius={60}
                                                            outerRadius={80}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                        >
                                                            {chartData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="flex flex-col gap-3 ml-8">
                                                {chartData.map(d => (
                                                    <div key={d.name} className="flex items-center gap-2 text-sm">
                                                        <span className="w-3 h-3 rounded-full" style={{ background: d.color }}></span>
                                                        <span className="text-slate-500">{d.name}:</span>
                                                        <span className="font-bold">{d.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-slate-400 mt-10">Chưa có dữ liệu cảm xúc</div>
                                    )}
                                </div>
                            </div>

                            {/* Bottom: Comments List */}
                            <div className="flex-1 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-700 dark:text-slate-200">
                                        Chi tiết Bình luận
                                    </h3>
                                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                        {['ALL', 'POSITIVE', 'NEGATIVE'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setSentimentFilter(type)}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${sentimentFilter === type
                                                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                                    }`}
                                            >
                                                {type === 'ALL' ? 'Tất cả' : type === 'POSITIVE' ? 'Tích cực' : 'Tiêu cực'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {loadingData ? (
                                        <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                                    ) : bookComments.length === 0 ? (
                                        <div className="text-center text-slate-400 mt-10">
                                            {sentimentFilter === 'ALL' ? 'Chưa có bình luận nào' : 'Không có bình luận theo bộ lọc này'}
                                        </div>
                                    ) : bookComments.map(c => (
                                        <div key={c.comment_id} className="p-3 border rounded-lg border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{c.user?.full_name}</span>
                                                    {c.sentiment && (
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${c.sentiment === 'POSITIVE' ? 'bg-green-100 text-green-700 border-green-200' :
                                                            c.sentiment === 'NEGATIVE' ? 'bg-red-100 text-red-700 border-red-200' :
                                                                'bg-slate-100 text-slate-600 border-slate-200'
                                                            }`}>
                                                            {c.sentiment}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString("vi-VN")}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{c.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900/20 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                            <BookOpen size={48} className="mb-4 opacity-50" />
                            <p>Chọn một sách để xem phân tích</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookAnalytics;
