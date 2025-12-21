import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function BookCard({ book, subject }) {
    return (
        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group">
            <div className='relative aspect-2/3 overflow-hidden bg-muted'>
                <img
                    src={book.imageUrl}
                    alt={book.title}
                    className='absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                />
                <Badge className={`absolute bottom-2 right-2 ${book.type === 'FREE' ? 'bg-green-500' : 'bg-yellow-600'}`}>
                    {book.type === 'FREE' ? 'Miễn phí' : 'Hội viên'}
                </Badge>
            </div>
            <CardContent className="p-4">
                <h3 className="font-semibold text-base line-clamp-2 mb-1">
                    {book.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                {subject && (
                    <Badge variant="secondary" className="text-xs">
                    {subject.name}
                    </Badge>
                )}
            </CardContent>
        </Card>
    
)}