import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function BookCard({ book, genre }) {
    return (
    <Link to={`/book/${book.id}`}>
        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group">
            <div className='relative aspect-2/3 overflow-hidden bg-muted'>
                <img
                    src={book.imageUrl}
                    alt={book.title}
                    className='absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                />
                {book.isFree && (
                    <Badge className="absolute top-2 right-2 bg-green-600 hover:bg-green-700">
                    Miễn phí
                    </Badge>
                )}
            </div>
            <CardContent className="p-4">
                <h3 className="font-semibold text-base line-clamp-2 mb-1">
                    {book.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                {genre && (
                    <Badge variant="secondary" className="text-xs">
                    {genre.name}
                    </Badge>
                )}
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <p className="text-xs text-muted-foreground">{book.totalPages} trang</p>
            </CardFooter>
        </Card>
    </Link>
)}