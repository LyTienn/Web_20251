import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { ChevronRight, List, FileText, ChevronLeft, ArrowLeft } from "lucide-react";
import Header from "@/components/HeaderBar";
import { toast } from "react-toastify";
import axios from "@/config/Axios-config";
import { debounce } from "lodash";

export default function ReadBookPage() {
  const { id: bookId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [initialScrollPos, setInitialScrollPos] = useState(0);
  const isRestoring = useRef(false);

  const contentRef = useRef(null);

  const saveProgress = useRef(
    debounce(async (bId, cId, scrollPercent) => {
      try {
        await axios.put(`/bookshelf/books/${bId}/progress`, { 
            chapterId: cId,
            scrollPosition: scrollPercent 
        });

      } catch (error) {
        console.error("❌ Lỗi lưu tiến độ:", error);
      }
    }, 1000) 
  ).current;

  useEffect(() => {
    return () => {
      saveProgress.cancel(); 
    };
  }, [saveProgress]);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Bạn cần đăng nhập để đọc sách.");
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (bookId && isAuthenticated) {
      const initReadingStatus = async () => {
        try {
          await axios.post(`/bookshelf/books/${bookId}`, { 
              bookId: bookId, 
              status: 'READING' 
          });
        } catch (error) {
          console.log("Sách đã có trong tủ");
        }
      };
      initReadingStatus();
    }
  }, [bookId, isAuthenticated]);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`/books/${bookId}`);
        setBook(res.data);
      } catch (err) {
        toast.error("Lỗi khi tải thông tin sách.");
      }
    };
    fetchBook();
  }, [bookId]);

  useEffect(() => {
    const fetchChaptersAndProgress = async () => {
      if (!bookId) return;

      try {
        setLoading(true);
        const [resChapters, resProgress] = await Promise.all([
            axios.get(`/books/${bookId}/chapters`),
            isAuthenticated ? axios.get(`/bookshelf/books/${bookId}/progress`).catch(() => null) : null
        ]);

        let finalChapters = [];
        const rawChaps = resChapters; 
        if (Array.isArray(rawChaps)) finalChapters = rawChaps;
        else if (rawChaps.data && Array.isArray(rawChaps.data)) finalChapters = rawChaps.data;
        else if (rawChaps.data?.data && Array.isArray(rawChaps.data.data)) finalChapters = rawChaps.data.data;      
        setChapters(finalChapters);

        let chapterToLoad = null;
        let scrollPosToLoad = 0;

        if (resProgress && resProgress.data) {
            const { lastChapterId, lastReadScrollPosition } = resProgress.data;
            
            if (lastChapterId) {
                chapterToLoad = finalChapters.find(ch => ch.id === lastChapterId);
                if (lastReadScrollPosition) {
                    scrollPosToLoad = lastReadScrollPosition;
                }
            }
        }

        if (!chapterToLoad && finalChapters.length > 0) {
            chapterToLoad = finalChapters[0];
        }

        setSelectedChapter(chapterToLoad);
        setInitialScrollPos(scrollPosToLoad); 

        if (chapterToLoad && resProgress?.data?.lastChapterId) {
             toast.info(`Đọc tiếp: ${chapterToLoad.title}`, { 
                 autoClose: 2000, 
                 toastId: 'resume-toast' 
             });
        }

      } catch (err) {
        console.error(err);
        toast.error("Lỗi khi tải dữ liệu sách.");
      } finally {
        setLoading(false);
      }
    };

    fetchChaptersAndProgress();
  }, [bookId, isAuthenticated]);

  useEffect(() => {
    if (selectedChapter?.id && selectedChapter?.content && contentRef.current) {       
      if (initialScrollPos > 0) {
        isRestoring.current = true; 
        let attempts = 0;
        const maxAttempts = 20;    
        const tryRestoringScroll = () => {
          const element = contentRef.current;
          if (!element) return;
          const scrollHeight = element.scrollHeight;
          const clientHeight = element.clientHeight;
          if (scrollHeight <= clientHeight && attempts < maxAttempts) {
            attempts++;
            requestAnimationFrame(tryRestoringScroll); 
            return;
          }
          const targetPixel = (initialScrollPos / 100) * (scrollHeight - clientHeight);
                 
          if (targetPixel > 0) {
            element.scrollTo({ top: targetPixel, behavior: 'auto' });
            if (Math.abs(element.scrollTop - targetPixel) < 20) {
              setInitialScrollPos(0);
              setTimeout(() => { isRestoring.current = false; }, 500);
              } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(tryRestoringScroll, 50);
              } else {
                isRestoring.current = false;
              }
          } else {
              isRestoring.current = false;
            }
        };
        tryRestoringScroll();     
        } else {
            contentRef.current.scrollTo({ top: 0, behavior: 'auto' });
        }
    }
  }, [selectedChapter?.id, selectedChapter?.content, initialScrollPos]);


  // B. Sự kiện cuộn (Đã thêm chặn khi đang restore)
  const handleScroll = (e) => {
    if (isRestoring.current) return; 
    if (!isAuthenticated || !selectedChapter) return;    
    const target = e.target;
    const { scrollTop, scrollHeight, clientHeight } = target;    
    if (scrollHeight - clientHeight <= 0) return;
    const scrolledPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;  
    saveProgress(bookId, selectedChapter.id, scrolledPercent);
  };

  const getCurrentChapterIndex = () => {
    if (!selectedChapter || chapters.length === 0) return -1;
    return chapters.findIndex(ch => ch.id === selectedChapter.id);
  };

  const handlePrevChapter = () => {
    const idx = getCurrentChapterIndex();
    if (idx > 0) setSelectedChapter(chapters[idx - 1]);
  };

  const handleNextChapter = () => {
    const idx = getCurrentChapterIndex();
    if (idx >= 0 && idx < chapters.length - 1) setSelectedChapter(chapters[idx + 1]);
  };

  if (!book) return <div className="min-h-screen bg-background"><Header /><div className="container mx-auto p-4">Đang tải...</div></div>;

  const currentIndex = getCurrentChapterIndex();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className={`bg-white border-r border-slate-200 shrink-0 transition-all duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'w-80 translate-x-0' : 'w-12'} `}>
        <div className="h-14 border-b flex items-center justify-between px-3 bg-slate-50">
            {sidebarOpen ? (
                <>
                    <h2 className="font-bold text-slate-800 flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4" /> Mục lục
                    </h2>
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                        <List className="h-5 w-5 text-slate-600" />
                    </Button>
                </>
            ) : (
                <div className="w-full flex justify-center">
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                        <List className="h-5 w-5 text-slate-600" />
                    </Button>
                </div>
            )}
        </div>
        
        {sidebarOpen && (
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {chapters.map((ch, index) => (
                    <button
                        key={ch.id || index}
                        onClick={() => setSelectedChapter(ch)}
                        className={`w-full text-left px-4 py-3 text-sm rounded-md transition-colors duration-200 mb-1 ${selectedChapter?.id === ch.id ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 border-l-4 border-transparent'}`}
                    >
                        <span className="line-clamp-2">{ch.title || `Chương ${index + 1}`}</span>
                    </button>
                ))}
            </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white h-full">
        <div className="h-14 border-b bg-white flex items-center px-4 justify-between shadow-sm z-10 shrink-0">
            <div className="flex items-center gap-3">
                <Link to={`/book/${book.id}`}><Button variant="ghost" size="sm"><ArrowLeft /></Button></Link>
                <h1 className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-md ml-2">{book.title}</h1>
            </div>
        </div>

        <div 
            ref={contentRef} 
            onScroll={handleScroll} 
            className="flex-1 overflow-y-auto bg-slate-50"
        >
          <div className="min-h-full w-full flex justify-center p-6 sm:p-10 md:p-14">
            <div className="w-full max-w-3xl bg-white shadow-sm border border-slate-100 rounded-lg p-8 sm:p-12 h-fit">
              {selectedChapter ? (
                <>
                  <article className="w-full prose prose-slate lg:prose-lg max-w-none">
                    <h2 className="text-3xl font-bold mb-6 text-slate-900 border-b pb-4">{selectedChapter.title}</h2>
                    <div className="whitespace-pre-line text-slate-700 leading-relaxed text-justify font-serif text-lg">{selectedChapter.content}</div>
                  </article>
                  
                  <div className="mt-12 pt-8 border-t border-slate-200 flex items-center justify-between gap-4">
                    <Button variant="outline" onClick={handlePrevChapter} disabled={currentIndex <= 0} className="flex gap-2">
                        <ChevronLeft className="h-4 w-4" /> Trước
                    </Button>
                    <div className="text-sm text-slate-500">Trang {currentIndex + 1} / {chapters.length}</div>
                    <Button variant="outline" onClick={handleNextChapter} disabled={currentIndex >= chapters.length - 1} className="flex gap-2">
                        Sau <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : <div className="text-center text-slate-400 py-20">Vui lòng chọn chương</div>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}