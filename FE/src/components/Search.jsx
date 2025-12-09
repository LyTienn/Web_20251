import { Search as SearchIcon } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { debounce } from "lodash";

const Search = ({ data = [], onResult }) => {
    const [open, setOpen] = useState(false);
    const [keyword, setKeyword] = useState("");
    const inputRef = useRef();

    //Debounce search function
    const debouncedSearch = useCallback(
        debounce((term) => {
            if(term) {
                const searched = data.filter((item) =>
                    item.title.toLowerCase().includes(term.toLowerCase())
                );
                onResult && onResult(searched);
            } else {
                onResult && onResult(data);
            }
        }, 400),
        [data, onResult]
    );

    const handleIconClick = () => {
        setOpen((prev) => !prev);
        setTimeout(() => {
            if(!open && inputRef.current) inputRef.current.focus();
        }, 150);
    };

    const handleInputBlur = () => setOpen(false);

    const handleChange = (e) => {
        const term = e.target.value;
        setKeyword(term);
        debouncedSearch(term);
    };

    return (
        <form className="relative flex items-center" onSubmit={e => e.preventDefault()}>
        <button
            type="button"
            onClick={handleIconClick}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            tabIndex={0}
        >
            <SearchIcon className="h-5 w-5" />
        </button>
        <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={handleChange}
            onBlur={handleInputBlur}
            placeholder="Tìm kiếm sách..."
            className={`
            absolute right-0 top-1/2 -translate-y-1/2
            bg-white border-gray-200 rounded px-3 py-1
            shadow transition-all duration-300
            ${open ? "opacity-100 w-52 scale-100 pointer-events-auto" : "opacity-0 w-0 scale-95 pointer-events-none"}
            `}
            style={{ zIndex: 100 }}
        />
        </form>
    );
};

export default Search;