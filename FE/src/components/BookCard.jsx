import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function BookCard({ book, subject }) {
    const navigate = useNavigate();
    const imageUrl = book.image_url || book.imageUrl || "https://placehold.co/400x600?text=No+Image";
    const authorName = typeof book.author === 'object' ? book.author?.name : book.author;

    return (
        <Card 
            className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group"
            onClick={() => navigate(`/book/${book.id}`)} 
        >
            <div className='relative aspect-2/3 overflow-hidden bg-muted'>
                <img
                    src={imageUrl}
                    alt={book.title}
                    className='absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x600?text=Error"; }}
                />
                <Badge className={`absolute bottom-2 right-2 ${book.type === 'FREE' ? 'bg-green-500' : 'bg-yellow-600'}`}>
                    {book.type === 'FREE' ? 'Miễn phí' : 'Hội viên'}
                </Badge>
            </div>
            <CardContent className="p-4">
                <h3 className="font-semibold text-base line-clamp-2 mb-1" title={book.title}>
                    {book.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                    {authorName || "Unknown Author"}
                </p>
                {subject && (
                    <Badge variant="secondary" className="text-xs">
                    {subject.name}
                    </Badge>
                )}
            </CardContent>
        </Card>
    )
}