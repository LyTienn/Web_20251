import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, List, FileText, ChevronLeft, ArrowLeft, Headphones, Sparkles, Loader2, Lock, Globe, Palette } from "lucide-react";
import Header from "@/components/HeaderBar";
import { toast } from "react-toastify";
import axios from "@/config/Axios-config";
import { debounce } from "lodash";
import AudioPlayer from "@/components/AudioPlayer";
import ComicReader from "@/components/ComicReader";
import { useProgress } from "@/contexts/ProgressContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

  // Summary State
  const [showSummaryView, setShowSummaryView] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Translation State
  const [showTranslationView, setShowTranslationView] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("English");

  const [isTranslating, setIsTranslating] = useState(false);

  // Comic State
  const [comicData, setComicData] = useState([]);
  const [isGeneratingComic, setIsGeneratingComic] = useState(false);
  const [showComicReader, setShowComicReader] = useState(false);


  const isRestoring = useRef(false);
  const hasMarkedCompleted = useRef(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const contentRef = useRef(null);
  const { addTask, updateTask, removeTask } = useProgress();

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
          // Check if book is already in bookshelf
          const checkResponse = await axios.get(`/bookshelf/books/${bookId}/check`);

          // Only add if not already in READING status
          if (!checkResponse.data?.isReading) {
            await axios.post(`/bookshelf/books/${bookId}`, {
              bookId: bookId,
              status: 'READING'
            });
          }
        } catch (error) {
          // Silently ignore errors - bookshelf management is not critical
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

  const markBookAsCompleted = async () => {
    if (hasMarkedCompleted.current) return;
    hasMarkedCompleted.current = true;
    saveProgress.cancel();
    try {
      await axios.delete(`/bookshelf/books/${bookId}?status=READING`);
      return;
    } catch (error) {
      console.error("Lỗi xóa sách:", error);
      hasMarkedCompleted.current = false;
    }
  };

  const handleScroll = (e) => {
    if (isRestoring.current || hasMarkedCompleted.current) return;
    if (!isAuthenticated || !selectedChapter) return;
    const target = e.target;
    const { scrollTop, scrollHeight, clientHeight } = target;
    if (scrollHeight - clientHeight <= 0) return;
    const scrolledPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;
    const currentIndex = getCurrentChapterIndex();
    const isLastChapter = currentIndex === chapters.length - 1;

    if (isLastChapter && scrolledPercent > 95) {
      markBookAsCompleted();
    } else {
      saveProgress(bookId, selectedChapter.id, scrolledPercent);
    }
  };

  const getCurrentChapterIndex = () => {
    if (!selectedChapter || chapters.length === 0) return -1;
    return chapters.findIndex(ch => ch.id === selectedChapter.id);
  };

  const handleSelectChapter = (ch) => {
    if (ch.isLocked) {
      setShowUpgradeModal(true);
      return;
    }
    setInitialScrollPos(0);
    setSelectedChapter(ch);
    setShowSummaryView(false); // Reset to full content view
    setSummaryText(""); // Clear previous summary
    setShowTranslationView(false);
    setShowTranslationView(false);
    setTranslatedText("");
    // Check for existing comic data
    if (ch.comic_data && ch.comic_data.length > 0) {
      setComicData(ch.comic_data);
    } else {
      setComicData([]);
    }
  };

  const handlePrevChapter = () => {
    const idx = getCurrentChapterIndex();
    if (idx > 0) {
      setInitialScrollPos(0);
      setSelectedChapter(chapters[idx - 1]);
    }
  };

  const handleNextChapter = () => {
    const idx = getCurrentChapterIndex();
    if (idx >= 0 && idx < chapters.length - 1) {
      const nextChapter = chapters[idx + 1];
      if (nextChapter.isLocked) {
        setShowUpgradeModal(true);
        return;
      }
      setInitialScrollPos(0);
      setSelectedChapter(nextChapter);
    }
  };

  const pollSummaryTask = async (taskId) => {
    try {
      const res = await axios.get(`/tasks/${taskId}`);
      const task = res.data || res;

      if (task.status === 'COMPLETED') {
        if (task.result && task.result.summary) {
          setSummaryText(task.result.summary);
        } else {
          setSummaryText("Không tìm thấy kết quả tóm tắt.");
        }
        setIsSummarizing(false);

        // Update global progress tracker
        updateTask(taskId, { status: 'COMPLETED' });
        // Auto-remove after 3 seconds
        setTimeout(() => removeTask(taskId), 3000);
        return;
      }

      if (task.status === 'FAILED') {
        setSummaryText("Lỗi tạo tóm tắt: " + (task.error || 'Unknown error'));
        setIsSummarizing(false);

        // Update global progress tracker
        updateTask(taskId, { status: 'FAILED', error: task.error });
        return;
      }

      // Update progress in global tracker
      if (task.progress) {
        updateTask(taskId, { progress: task.progress, status: task.status });
      }

      // Continue polling
      setTimeout(() => pollSummaryTask(taskId), 3000);

    } catch (error) {
      console.error("Polling error:", error);
      setSummaryText("Lỗi khi kiểm tra trạng thái tóm tắt.");
      setIsSummarizing(false);
    }
  };

  const handleToggleSummary = async (checked) => {
    setShowSummaryView(checked);
    if (checked) setShowTranslationView(false);

    if (!checked) {
      // Switching back to full content, no action needed
      return;
    }

    // Switching to summary view
    if (!selectedChapter || !selectedChapter.content) return;

    // Check if summary is already cached
    if (selectedChapter.summary) {
      setSummaryText(selectedChapter.summary);
      setIsSummarizing(false);
      return;
    }

    // No cache, generate new summary
    setIsSummarizing(true);
    setSummaryText("");

    try {
      const response = await axios.post("/summary", {
        text: selectedChapter.content,
        chapterId: selectedChapter.id
      });

      const data = response.data || response;

      if (data.taskId) {
        // Add to global progress tracker
        addTask({
          id: data.taskId,
          type: 'SUMMARY',
          bookTitle: book?.title || 'Unknown Book',
          chapterTitle: selectedChapter.title,
          progress: { current: 0, total: 100, stage: 'init' },
          status: 'PENDING'
        });

        // Start Polling
        pollSummaryTask(data.taskId);
      } else if (data.summary) {
        // Immediate result (cached)
        setSummaryText(data.summary);
        setIsSummarizing(false);
      } else {
        setSummaryText("Không nhận được phản hồi hợp lệ.");
        setIsSummarizing(false);
      }

    } catch (error) {
      console.error("Summary error:", error);
      setSummaryText("Không thể tạo tóm tắt vào lúc này. Vui lòng thử lại sau.");
      toast.error("Lỗi khi tạo tóm tắt");
      setIsSummarizing(false);
    }
  };

  const pollTranslationTask = async (taskId) => {
    try {
      const res = await axios.get(`/tasks/${taskId}`);
      const task = res.data || res;

      if (task.status === 'COMPLETED') {
        if (task.result && task.result.translation) {
          setTranslatedText(task.result.translation);
        } else {
          setTranslatedText("Không tìm thấy kết quả dịch.");
        }
        setIsTranslating(false);

        // Update global progress tracker
        updateTask(taskId, { status: 'COMPLETED' });
        // Auto-remove after 3 seconds
        setTimeout(() => removeTask(taskId), 3000);
        return;
      }

      if (task.status === 'FAILED') {
        setTranslatedText("Lỗi dịch thuật: " + (task.error || 'Unknown error'));
        setIsTranslating(false);

        // Update global progress tracker
        updateTask(taskId, { status: 'FAILED', error: task.error });
        return;
      }

      // Update progress in global tracker
      if (task.progress) {
        updateTask(taskId, { progress: task.progress, status: task.status });
      }

      // Continue polling
      setTimeout(() => pollTranslationTask(taskId), 3000);

    } catch (error) {
      console.error("Polling error:", error);
      setTranslatedText("Lỗi khi kiểm tra trạng thái dịch.");
      setIsTranslating(false);
    }
  };

  const handleToggleTranslation = async (checked) => {
    setShowTranslationView(checked);
    if (checked) setShowSummaryView(false); // Disable summary if translation is on

    if (!checked) return;

    if (!selectedChapter || !selectedChapter.content) return;

    // Check cache locally if we already fetched it in this session (optimized)
    // Ideally we should check backend cache via API, but let's try to fetch

    setIsTranslating(true);
    setTranslatedText("");

    try {
      const response = await axios.post("/translate", {
        text: selectedChapter.content,
        chapterId: selectedChapter.id,
        targetLanguage: targetLanguage
      });

      const data = response.data || response;

      if (data.taskId) {
        // Add to global progress tracker
        addTask({
          id: data.taskId,
          type: 'TRANSLATE',
          bookTitle: book?.title || 'Unknown Book',
          chapterTitle: selectedChapter.title,
          progress: { current: 0, total: 100, stage: 'init' },
          status: 'PENDING'
        });

        pollTranslationTask(data.taskId);
      } else if (data.status === 'COMPLETED' && data.result) {
        setTranslatedText(data.result.translation);
        setIsTranslating(false);
      } else {
        setTranslatedText("Không nhận được phản hồi hợp lệ.");
        setIsTranslating(false);
      }
    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedText("Không thể dịch vào lúc này. Vui lòng thử lại sau.");
      toast.error("Lỗi khi dịch");
      setIsTranslating(false);
    }
  };

  const handleLanguageChange = (e) => {
    setTargetLanguage(e.target.value);
    if (showTranslationView) {
      // Re-trigger translation if view is active
      setIsTranslating(true); // temporary loading
      handleToggleTranslation(true);
    }
  };

  const pollComicTask = async (taskId) => {
    try {
      const res = await axios.get(`/tasks/${taskId}`);
      const task = res.data || res;

      if (task.status === 'COMPLETED') {
        setIsGeneratingComic(false);
        // Reload comic data
        try {
          // If we had a specific endpoint or just rely on chapter data reload. 
          // But our test script fetches /comic/:chapterId. Let's use that.
          const comicRes = await axios.get(`/comic/${selectedChapter.id}`);
          const data = comicRes.data || comicRes;
          if (data && data.comic_data) {
            setComicData(data.comic_data);
            // Update local chapter state to include new data
            setChapters(prev => prev.map(c => c.id === selectedChapter.id ? { ...c, comic_data: data.comic_data } : c));
            setSelectedChapter(prev => ({ ...prev, comic_data: data.comic_data }));
          }
        } catch (e) { console.error("Error fetching comic result", e) }

        updateTask(taskId, { status: 'COMPLETED' });
        setTimeout(() => removeTask(taskId), 3000);
        toast.success("Đã tạo truyện tranh xong!");
        return;
      }

      if (task.status === 'FAILED') {
        setIsGeneratingComic(false);
        updateTask(taskId, { status: 'FAILED', error: task.error });
        toast.error("Lỗi tạo truyện tranh: " + task.error);
        return;
      }

      if (task.progress) {
        updateTask(taskId, { progress: task.progress, status: task.status });
      }

      setTimeout(() => pollComicTask(taskId), 3000);
    } catch (error) {
      console.error("Comic Polling error:", error);
      setIsGeneratingComic(false);
    }
  };

  const handleGenerateComic = async () => {
    if (!selectedChapter) return;
    setIsGeneratingComic(true);
    try {
      const response = await axios.post("/comic/generate", {
        chapterId: selectedChapter.id
      });
      const data = response.data || response;

      // Case 1: Comic already exists or returned immediately
      if (data.status === 'COMPLETED' && data.comic_data) {
        setComicData(data.comic_data);
        setChapters(prev => prev.map(c => c.id === selectedChapter.id ? { ...c, comic_data: data.comic_data } : c));
        setSelectedChapter(prev => ({ ...prev, comic_data: data.comic_data }));
        setIsGeneratingComic(false);
        toast.success("Truyện tranh đã sẵn sàng!");
        return;
      }

      // Case 2: New Task Started (or existing pending task returned)
      if (data.taskId) {
        addTask({
          id: data.taskId,
          type: 'COMIC',
          bookTitle: book?.title,
          chapterTitle: selectedChapter.title,
          progress: { current: 0, total: 100, stage: 'initializing' },
          status: data.status || 'PENDING'
        });
        pollComicTask(data.taskId);
      } else {
        setIsGeneratingComic(false);
      }
    } catch (error) {
      console.error("Generate Comic error:", error);
      toast.error("Không thể bắt đầu tạo truyện tranh");
      setIsGeneratingComic(false);
    }
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
                onClick={() => handleSelectChapter(ch)}
                className={`w-full text-left px-4 py-3 text-sm rounded-md transition-colors duration-200 mb-1 ${selectedChapter?.id === ch.id ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 border-l-4 border-transparent'}`}
              >
                <span className="line-clamp-2">{ch.title || `Chương ${index + 1}`}</span>
                {ch.isLocked && <Lock className="h-3 w-3 text-slate-400 shrink-0 ml-2" />}
              </button>
            ))}
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white h-full relative">
        <div className="h-14 border-b bg-white flex items-center px-4 justify-between shadow-sm z-10 shrink-0 gap-4">
          <div className="flex items-center gap-3 min-w-0 shrink">
            <Link to={`/book/${book.id}`}><Button variant="ghost" size="sm"><ArrowLeft /></Button></Link>
            <h1 className="font-semibold text-slate-800 truncate text-sm sm:text-base">{book.title}</h1>
          </div>

          {selectedChapter && (
            <div className="flex gap-2 sm:gap-3 items-center shrink-0">
              <div className="h-9 flex items-center gap-2 px-3 rounded-lg border border-purple-200 bg-purple-50/50">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700 hidden sm:inline">Tóm tắt</span>
                <Switch
                  checked={showSummaryView}
                  onCheckedChange={handleToggleSummary}
                  className="data-[state=checked]:bg-purple-600 scale-90"
                />
              </div>

              <div className="h-9 flex items-center gap-2 px-3 rounded-lg border border-blue-200 bg-blue-50/50">
                <Globe className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 hidden sm:inline">Dịch</span>

                <Select value={targetLanguage} onValueChange={(val) => {
                  setTargetLanguage(val);
                  if (showTranslationView) {
                    setIsTranslating(true);
                    handleToggleTranslation(true); // Re-trigger
                  }
                }}>
                  <SelectTrigger className="w-[110px] h-7 text-xs border-blue-200 bg-white text-blue-700 focus:ring-0">
                    <SelectValue placeholder="Ngôn ngữ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                    <SelectItem value="Chinese">Chinese</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                    <SelectItem value="Korean">Korean</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Russian">Russian</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                  </SelectContent>
                </Select>

                <Switch
                  checked={showTranslationView}
                  onCheckedChange={handleToggleTranslation}
                  className="data-[state=checked]:bg-blue-600 scale-90"
                />
              </div>

              <div className="h-9 flex items-center gap-2 px-3 rounded-lg border border-orange-200 bg-orange-50/50">
                <Palette className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700 hidden sm:inline">Truyện tranh</span>

                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-2 text-xs border border-orange-200 text-orange-800 ${comicData.length > 0
                    ? "bg-orange-100 hover:bg-orange-200"
                    : "bg-white opacity-70 hover:opacity-100 hover:bg-orange-50"
                    }`}
                  onClick={() => {
                    if (comicData.length > 0) {
                      setShowComicReader(true);
                    } else {
                      handleGenerateComic();
                    }
                  }}
                  disabled={isGeneratingComic}
                >
                  {isGeneratingComic ? <Loader2 className="h-3 w-3 animate-spin" /> : (comicData.length > 0 ? "Đọc ngay" : "Tạo ngay")}
                </Button>
              </div>

              <Button
                variant={showAudioPlayer ? "secondary" : "outline"}
                size="sm"
                className="h-9 gap-2"
                onClick={() => setShowAudioPlayer(!showAudioPlayer)}
              >
                <Headphones className="h-4 w-4" />
                <span className="hidden sm:inline">Phát Audio</span>
              </Button>
            </div>
          )}
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

                    {showSummaryView ? (
                      // Summary View
                      <div className="bg-purple-50/30 border-l-4 border-purple-400 rounded-r-lg p-6">
                        {isSummarizing ? (
                          <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
                            <p className="text-slate-600 font-medium">AI đang tạo tóm tắt...</p>
                            <p className="text-sm text-slate-500">Quá trình này có thể mất vài phút với chương dài</p>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 mb-4 text-purple-700">
                              <Sparkles className="h-5 w-5" />
                              <span className="font-semibold text-sm uppercase tracking-wide">Bản tóm tắt AI</span>
                            </div>
                            <div className="whitespace-pre-line text-slate-700 leading-relaxed text-justify text-lg">
                              {summaryText || "Không có nội dung tóm tắt."}
                            </div>
                          </>
                        )}
                      </div>
                    ) : showTranslationView ? (
                      // Translation View
                      <div className="bg-blue-50/30 border-l-4 border-blue-400 rounded-r-lg p-6">
                        {isTranslating ? (
                          <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                            <p className="text-slate-600 font-medium">AI đang dịch sang {targetLanguage}...</p>
                            <p className="text-sm text-slate-500">Quá trình này có thể mất vài phút với chương dài</p>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 mb-4 text-blue-700">
                              <Globe className="h-5 w-5" />
                              <span className="font-semibold text-sm uppercase tracking-wide">Bản dịch ({targetLanguage})</span>
                            </div>
                            <div className="whitespace-pre-line text-slate-700 leading-relaxed text-justify text-lg font-serif">
                              {translatedText || "Không có nội dung dịch."}
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      // Full Content View
                      <div className="whitespace-pre-line text-slate-700 leading-relaxed text-justify font-serif text-lg">
                        {selectedChapter.content}
                      </div>
                    )}
                  </article>

                  <div className="mt-12 pt-8 border-t border-slate-200 flex items-center justify-between gap-4">
                    <Button variant="outline" onClick={handlePrevChapter} disabled={currentIndex <= 0} className="flex gap-2 hover:bg-gray-100">
                      <ChevronLeft className="h-4 w-4" /> Trước
                    </Button>
                    <div className="text-sm text-slate-500">Trang {currentIndex + 1} / {chapters.length}</div>
                    <Button variant="outline" onClick={handleNextChapter} disabled={currentIndex >= chapters.length - 1} className="flex gap-2 hover:bg-gray-100">
                      Sau <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : <div className="text-center text-slate-400 py-20">Vui lòng chọn chương</div>}
            </div>
          </div>
        </div>


        {showAudioPlayer && selectedChapter && (
          <AudioPlayer
            text={selectedChapter.content}
            chapterId={selectedChapter.id}
            bookTitle={book?.title}
            chapterTitle={selectedChapter.title}
            onClose={() => setShowAudioPlayer(false)}
          />
        )
        }

        <ComicReader
          isOpen={showComicReader}
          onClose={() => setShowComicReader(false)}
          comicData={comicData}
        />


      </main >
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto bg-yellow-100 p-3 rounded-full w-fit mb-2">
              <Lock className="h-6 w-6 text-yellow-600" />
            </div>
            <DialogTitle className="text-center text-xl">
              Nội dung dành cho Hội viên
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Sách này không miễn phí. <br />
              Hãy nâng cấp lên gói <strong>Premium</strong> để mở khóa toàn bộ nội dung và tận hưởng kho sách không giới hạn!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowUpgradeModal(false)} className="hover:bg-gray-200">
              Để sau
            </Button>
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
              onClick={() => navigate('/membership')} // Điều hướng đến trang mua gói
            >
              Nâng cấp ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
