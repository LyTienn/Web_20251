import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from "@/config/Axios-config";
import BookCard from "@/components/BookCard";
import Header from "@/components/HeaderBar";
import { Loader2, Search } from "lucide-react";

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query) return;
            try {
                setLoading(true);
                const res = await axios.get(`/books?keyword=${encodeURIComponent(query)}`);
                // Backend returns { success: true, data: { total, books: [] } }
                // Axios config unwraps initial response.data
                // So res is { success: true, data: { total, books: [] } }
                const resultData = res.data?.books || [];
                setBooks(Array.isArray(resultData) ? resultData : []);
            } catch (error) {
                console.error("Lỗi khi lấy kết quả tìm kiếm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSearchResults();
    }, [query]);

    return (
        <div className='min-h-screen bg-slate-50'>
            <Header />
            <main className='container mx-auto px-4 py-8 pt-8'>
                <div className='mb-8 border-b border-slate-200 pb-4'>
                    <h1 className='text-2xl font-bold text-slate-800'>
                        Kết quả tìm kiếm cho: <span className='text-blue-600'>"{query}"</span>
                    </h1>
                    <p className='text-slate-500 mt-1'>
                        {loading ? "Đang tìm kiếm..." : `Tim thấy ${books.length} cuốn sách phù hợp.`}
                    </p>
                </div>
                {loading ? (
                    <div className="flex flex-col justify-center items-center py-32 text-slate-400">
                        <Loader2 className="animate-spin w-10 h-10 mb-4 text-blue-600" />
                        <p>Đang tìm kiếm...</p>
                    </div>
                ) : (
                    <>
                        {books.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-10">
                                {books.map((book) => (
                                    <div key={book.id} className="min-w-[180px] max-w-[180px] shrink-0 cursor-pointer">
                                        <BookCard book={book} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-dashed border-slate-300 shadow-sm">
                                <div className="bg-slate-100 p-4 rounded-full mb-4">
                                    <Search className="w-10 h-10 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">Không tìm thấy cuốn nào</h3>
                                <p className="text-slate-500 max-w-md text-center mt-2 mb-6">
                                    Rất tiếc, chúng tôi không tìm thấy cuốn sách nào khớp với từ khóa
                                    <span className="font-semibold text-slate-700 mx-1">"{query}"</span>.
                                    Hãy thử tìm với từ khóa khác xem sao.
                                </p>
                                <Link to="/">
                                    <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition shadow-sm font-medium">
                                        Quay về Trang chủ
                                    </button>
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
};

export default SearchPage;