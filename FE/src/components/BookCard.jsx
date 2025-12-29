import { Star, Crown, BookOpen } from 'lucide-react';
import { useNavigate } from "react-router-dom";

export default function BookCard({ book, subject }) {
    const navigate = useNavigate();
    const imageUrl = book.image_url || book.imageUrl || "https://placehold.co/400x600?text=No+Image";
    const authorName = typeof book.author === 'object' ? book.author?.name : book.author;
    const isPremium = book.type === 'PREMIUM' || book.is_premium;

    return (
        <div
            onClick={() => navigate(`/book/${book.id}`)}
            className="group cursor-pointer relative"
        >
            {/* Book Cover Container */}
            <div className="relative mb-3 overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1">
                <div className="aspect-[2/3] overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={book.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x600?text=Error"; }}
                    />
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Badges - Premium */}
                {isPremium && (
                    <div className="absolute top-2 right-2">
                        <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg backdrop-blur-sm">
                            <Crown className="h-3 w-3 fill-white" />
                            PREMIUM
                        </div>
                    </div>
                )}

                {/* Badges - Free */}
                {!isPremium && (
                    <div className="absolute top-2 right-2">
                        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-1 text-[10px] font-bold text-white shadow-lg backdrop-blur-sm">
                            <BookOpen className="h-3 w-3" />
                            FREE
                        </div>
                    </div>
                )}

                {/* Rating/Stats on hover */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {book.rating && book.rating > 0 ? (
                        <div className="flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-md px-2 py-1 text-xs font-medium text-white">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-500" />
                            {parseFloat(book.rating).toFixed(1)}
                        </div>
                    ) : null}

                    {subject && (
                        <span className="text-[10px] font-medium text-white/90 line-clamp-1 max-w-[50%] text-right drop-shadow-md">
                            {subject.name}
                        </span>
                    )}
                </div>
            </div>

            {/* Book Info */}
            <div className="space-y-1">
                <h3
                    className="font-bold text-slate-800 line-clamp-1 transition-colors group-hover:text-blue-600"
                    title={book.title}
                >
                    {book.title}
                </h3>
                <p className="line-clamp-1 text-sm text-slate-500 font-medium">
                    {authorName || "Đang cập nhật"}
                </p>

                {/* Genre Text if available and not shown in badge to avoid clutter, or keep simple */}
            </div>
        </div>
    )
}