import { Search as SearchIcon, Loader2, X } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { debounce } from "lodash";
import axios from "@/config/Axios-config";

const Search = () => {
    const [open, setOpen] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef();
    const wrapperRef = useRef();
    const navigate = useNavigate();

    //API gợi ý (Chỉ lấy tối đa 5 cuốn)
    const fetchSuggestions = async (term) => {
        if (!term.trim()) {
            setSuggestions([]);
            return;
        }
        try {
            setLoading(true);
            //API search
            const res = await axios.get(`/books?keyword=${encodeURIComponent(term)}`);
            const data = res.data?.data || res.data || []; 
            setSuggestions(data.slice(0, 5)); 
        } catch (error) {
            console.error("Live search error:", error);
        } finally {
            setLoading(false);
        }
    };

    const debouncedFetch = useCallback(
        debounce((term) => fetchSuggestions(term), 400),
        []
    );

    const handleChange = (e) => {
        const term = e.target.value;
        setKeyword(term);
        if (term.trim()) {
            setOpen(true);
            debouncedFetch(term);
        } else {
            setSuggestions([]);
            setOpen(false);
        }
    };

    const goToSearchPage = () => {
        if (keyword.trim()) {
            navigate(`/search?q=${encodeURIComponent(keyword)}`);
            setOpen(false); // Đóng dropdown
            inputRef.current?.blur();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            goToSearchPage();
        }
    };

    const handleIconClick = () => {
        if (open && keyword) {
            goToSearchPage();
        } else {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    // Click ra ngoài thì đóng dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div ref={wrapperRef} className="relative z-50">
            {/* INPUT FORM */}
            <div className={`relative flex items-center transition-all duration-300 ${open ? "w-72" : "w-10"}`}>
                <button
                    type="button"
                    onClick={handleIconClick}
                    className="absolute left-0 p-2 rounded-full hover:bg-gray-100 z-10"
                >
                    <SearchIcon className="h-5 w-5 text-slate-600" />
                </button>
                
                <input
                    ref={inputRef}
                    type="text"
                    value={keyword}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => keyword && setOpen(true)}
                    placeholder="Tìm tên sách..."
                    className={`
                        w-full pl-10 pr-8 py-1.5 bg-white border border-gray-200 rounded-full
                        shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                        transition-all duration-300
                        ${open ? "opacity-100 visible" : "opacity-0 invisible w-0 p-0 border-none"}
                    `}
                />
                
                {/* Nút Xóa text */}
                {open && keyword && (
                    <button 
                        onClick={() => { setKeyword(""); setSuggestions([]); inputRef.current?.focus(); }}
                        className="absolute right-2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* DROPDOWN LIVE SEARCH */}
            {open && keyword && (
                <div className="absolute top-full mt-2 w-80 right-0 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden">
                    {loading ? (
                        <div className="p-4 text-center text-slate-400 flex justify-center items-center gap-2">
                            <Loader2 className="animate-spin h-4 w-4" /> Đang tìm...
                        </div>
                    ) : suggestions.length > 0 ? (
                        <ul>
                            {/* Danh sách gợi ý */}
                            {suggestions.map((book) => (
                                <li key={book.id} className="border-b border-slate-50 last:border-none">
                                    <Link 
                                        to={`/book/${book.id}`} 
                                        className="px-4 py-3 hover:bg-slate-50 transition flex items-start gap-3"
                                        onClick={() => setOpen(false)}
                                    >
                                        <div className="w-10 h-14 bg-slate-200 rounded shrink-0 overflow-hidden">
                                            <img src={book.image_url} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800 line-clamp-1">{book.title}</p>
                                            <p className="text-xs text-slate-500 line-clamp-1">{book.author?.name || "Tác giả ẩn danh"}</p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                            
                            <li className="bg-slate-50 p-2 text-center">
                                <button 
                                    onClick={goToSearchPage}
                                    className="text-sm text-blue-600 font-medium hover:underline w-full py-1"
                                >
                                    Xem tất cả kết quả cho "{keyword}"
                                </button>
                            </li>
                        </ul>
                    ) : (
                        <div className="p-4 text-center text-slate-500 text-sm">
                            Không tìm thấy sách nào.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;