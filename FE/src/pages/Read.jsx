import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { ChevronRight, List, FileText, ChevronLeft, ArrowLeft } from "lucide-react";
import Header from "@/components/HeaderBar";
import { toast } from "react-toastify";
import axios from "@/config/Axios-config";

export default function ReadBookPage() {
  const { id: bookId } = useParams();
  const params = useParams()
  const navigate = useNavigate()
  const { isAuthenticated} = useSelector((state) => state.auth);

  useEffect(() => {
  if (!isAuthenticated) {
    toast.error("Bạn cần đăng nhập để đọc sách.");
    navigate("/login");
  }
}, [isAuthenticated, navigate]);
  
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Ref để cuộn lên đầu khi đổi chương
  const contentRef = useRef(null);

  //AUTH CHECK
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Bạn cần đăng nhập để đọc sách.");
      navigate("/login");
    }
  }, [ isAuthenticated, navigate ]);
  
  useEffect(() => {
    const fetchBook = async() => {
      try {
        const res = await axios.get(`/books/${bookId}`);
        setBook(res.data);
      } catch (err) {
        toast.error("Lỗi khi tải sách.");
      }
    };
    fetchBook();
  }, [bookId]);

  useEffect(() => {
    const fetchChapters = async() => {
      // 1. Kiểm tra an toàn: Nếu không có bookId thì dừng ngay
      if (!bookId) {
          console.log("⚠️ Chưa có Book ID");
          return;
      }

      try {
        console.log("🚀 Đang gọi API lấy chương cho Book ID:", bookId);
        const res = await axios.get(`/books/${bookId}/chapters`);
        console.log("👉 Kết quả API trả về (res):", res);

        let finalChapters = [];

        // Interceptor đã xử lý, res chính là mảng chương
        if (Array.isArray(res)) {
             console.log("✅ Case 1: res là mảng -> Lấy res");
             finalChapters = res;
        } 
        // res là object chứa data (VD: {success: true, data: [...]})
        else if (res.data && Array.isArray(res.data)) {
             console.log("✅ Case 2: res.data là mảng -> Lấy res.data");
             finalChapters = res.data;
        }
        // Axios response chuẩn (VD: res.data.data)
        else if (res.data?.data && Array.isArray(res.data.data)) {
             console.log("✅ Case 3: res.data.data là mảng -> Lấy res.data.data");
             finalChapters = res.data.data;
        } 
        else {
             console.error("❌ Không tìm thấy mảng dữ liệu nào hợp lệ trong response!");
        }

        console.log("📦 Dữ liệu sẽ set vào State:", finalChapters);
        setChapters(finalChapters);

      } catch (err) {
        console.error("❌ Lỗi API:", err);
        toast.error("Lỗi khi tải chương sách.");
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [bookId]);

  useEffect(() => {
    if(selectedChapter && contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedChapter]);

  const getCurrentChapterIndex = () => {
    if (!selectedChapter || chapters.length === 0) return -1;
    return chapters.findIndex(ch => ch.id === selectedChapter.id);
  };

  const getPrevChapter = () => {
    const currentIndex = getCurrentChapterIndex();
    if (currentIndex > 0) {
      return chapters[currentIndex - 1];
    }
    return null;
  };

  const getNextChapter = () => {
    const currentIndex = getCurrentChapterIndex();
    if (currentIndex >= 0 && currentIndex < chapters.length - 1) {
      return chapters[currentIndex + 1];
    }
    return null;
  };

  const handlePrevChapter = () => {
    const prevChapter = getPrevChapter();
    if (prevChapter) {
      setSelectedChapter(prevChapter);
    }
  };

  const handleNextChapter = () => {
    const nextChapter = getNextChapter();
    if (nextChapter) {
      setSelectedChapter(nextChapter);
    }
  };

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p>Không tìm thấy sách</p>
        </div>
      </div>
    )
  }

  const currentIndex = getCurrentChapterIndex();
  const prevChapter = getPrevChapter();
  const nextChapter = getNextChapter();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside 
        className={`
            bg-white border-r border-slate-200 flex-shrink-0 transition-all duration-300 ease-in-out flex flex-col
            ${sidebarOpen ? 'w-80 translate-x-0' : 'w-12'} 
        `}
      >
        <div className="h-14 border-b flex items-center justify-between px-3 bg-slate-50">
            {sidebarOpen ? (
                <>
                    <h2 className="font-bold text-slate-800 flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4" /> Mục lục
                    </h2>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setSidebarOpen(false)}
                        title="Đóng mục lục"
                    >
                        <List className="h-5 w-5 text-slate-600" />
                    </Button>
                </>
            ) : (
                <div className="w-full flex justify-center">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setSidebarOpen(true)}
                        title="Mở mục lục"
                    >
                        <List className="h-5 w-5 text-slate-600" />
                    </Button>
                </div>
            )}
        </div>
        
        {sidebarOpen && (
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {chapters.length === 0 ? (
                    <div className="text-center p-8 text-slate-400 text-sm">Chưa có mục lục.</div>
                ) : (
                    <ul className="space-y-1">
                        {chapters.map((ch, index) => (
                            <li key={ch.id || index}>
                                <button
                                    onClick={() => setSelectedChapter(ch)}
                                    className={`
                                        w-full text-left px-4 py-3 text-sm rounded-md transition-colors duration-200
                                        ${selectedChapter?.id === ch.id 
                                            ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600' 
                                            : 'text-slate-600 hover:bg-slate-100 border-l-4 border-transparent'}
                                    `}
                                >
                                    <span className="line-clamp-2">{ch.title || `Chương ${index + 1}`}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        )}
      </aside>

      {/* === RIGHT MAIN CONTENT (Nội dung đọc) === */}
      <main className="flex-1 flex flex-col min-w-0 bg-white h-full">
        
        <div className="h-14 border-b bg-white flex items-center px-4 justify-between shadow-sm z-10 flex-shrink-0">
            <div className="flex items-center gap-3">
                <Link to={`/book/${book.id}`} title="Quay lại">
                    <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-slate-900">
                        <ArrowLeft />
                    </Button>
                </Link>
                <h1 className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-md ml-2">
                    {book.title}
                </h1>
            </div>
        </div>

        <div ref={contentRef} className="flex-1 overflow-y-auto bg-slate-50 scroll-smooth">
          <div className="min-h-full w-full flex justify-center p-6 sm:p-10 md:p-14">
            
            <div className="w-full max-w-3xl bg-white shadow-sm border border-slate-100 rounded-lg p-8 sm:p-12 h-fit">
              {selectedChapter ? (
                <>
                  <article className="w-full prose prose-slate lg:prose-lg max-w-none">
                    <h2 className="text-3xl font-bold mb-6 text-slate-900 border-b pb-4">
                      {selectedChapter.title}
                    </h2>
                    
                    <div className="whitespace-pre-line text-slate-700 leading-relaxed text-justify font-serif text-lg break-words ">
                      {selectedChapter.content || (
                        <p className="italic text-slate-400 text-center py-10">
                          (Nội dung đang cập nhật...)
                        </p>
                      )}
                    </div>
                  </article>

                  <div className="mt-12 pt-8 border-t border-slate-200 flex items-center justify-between gap-4">
                    <Button
                      variant="outline"
                      onClick={handlePrevChapter}
                      disabled={!prevChapter}
                      className="flex items-center gap-2 hover:bg-gray-100"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Trang trước</span>
                      <span className="sm:hidden">Trước</span>
                    </Button>

                    <div className="text-sm text-slate-500 text-center">
                      {currentIndex >= 0 && (
                        <span>
                          Trang {currentIndex + 1} / {chapters.length}
                        </span>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      onClick={handleNextChapter}
                      disabled={!nextChapter}
                      className="flex items-center gap-2 hover:bg-gray-100"
                    >
                      <span className="hidden sm:inline">Trang sau</span>
                      <span className="sm:hidden">Sau</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
                  <FileText className="h-16 w-16 mb-4 opacity-20" />
                  <p>Vui lòng chọn một chương để bắt đầu đọc.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}