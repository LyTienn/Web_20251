import { Search as SearchIcon, Loader2, X } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { debounce } from "lodash";
import axios from "@/config/Axios-config";

const Search = ({ variant = "dynamic", className = "" }) => {
    const [isOpen, setIsOpen] = useState(variant === "static");
    const [keyword, setKeyword] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();

    // In static mode, always open interaction-wise, but we manage dropdown visibility differently
    const [showDropdown, setShowDropdown] = useState(false);

    // Sync variant changes or init
    useEffect(() => {
        if (variant === "static") {
            setIsOpen(true);
        }
    }, [variant]);

    //API gợi ý (Chỉ lấy tối đa 5 cuốn)
    const fetchSuggestions = async (term) => {
        if (!term.trim()) {
            setSuggestions([]);
            return;
        }
        try {
            setLoading(true);
            const res = await axios.get(`/books?keyword=${encodeURIComponent(term)}`);
            const resultData = res.data?.books || [];
            setSuggestions(Array.isArray(resultData) ? resultData.slice(0, 5) : []);
        } catch (error) {
            console.error("Live search error:", error);
            setSuggestions([]);
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
            if (variant === "dynamic") setIsOpen(true);
            setShowDropdown(true);
            debouncedFetch(term);
        } else {
            setSuggestions([]);
            setShowDropdown(false);
            if (variant === "dynamic") setIsOpen(false);
        }
    };

    const goToSearchPage = () => {
        if (keyword.trim()) {
            navigate(`/search?q=${encodeURIComponent(keyword)}`);
            setShowDropdown(false);
            if (variant === "dynamic") setIsOpen(false);
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
        if (variant === "static") {
            inputRef.current?.focus();
            return;
        }

        if (isOpen && keyword) {
            goToSearchPage();
        } else {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    // Click ra ngoài thì đóng dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
                if (variant === "dynamic" && !keyword) {
                    setIsOpen(false);
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef, variant, keyword]);

    const containerClasses = variant === "static"
        ? `relative flex items-center w-full ${className}`
        : `relative flex items-center transition-all duration-300 ${isOpen ? "w-72" : "w-10"} ${className}`;

    const inputClasses = variant === "static"
        ? `w-full pl-10 pr-8 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 transition-colors`
        : `w-full pl-10 pr-8 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible w-0 p-0 border-none"}`;

    return (
        <div ref={wrapperRef} className={`relative z-50 ${variant === "static" ? "w-full" : ""}`}>
            {/* INPUT FORM */}
            <div className={containerClasses}>
                <button
                    type="button"
                    onClick={handleIconClick}
                    className={`absolute left-0 p-2 rounded-full z-10 ${variant === "static" ? "cursor-default" : "hover:bg-gray-100"}`}
                >
                    <SearchIcon className={`h-4 w-4 ${variant === "static" ? "text-muted-foreground" : "text-slate-600"}`} />
                </button>

                <input
                    ref={inputRef}
                    id="main-search"
                    name="main-search"
                    type="text"
                    value={keyword}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => keyword && setShowDropdown(true)}
                    placeholder="Tìm kiếm sách, tác giả..."
                    aria-label="Tìm kiếm sách"
                    className={inputClasses}
                />

                {/* Nút Xóa text */}
                {isOpen && keyword && (
                    <button
                        onClick={() => { setKeyword(""); setSuggestions([]); setShowDropdown(false); inputRef.current?.focus(); }}
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