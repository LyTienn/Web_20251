import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getBookById } from "../lib/mockdata";
import { ArrowLeft } from "lucide-react"
import { toast } from "react-toastify";
import PDFViewer from "@/components/ui/pdf-viewer";

export default function ReadBookPage() {
  const params = useParams()
  const navigate = useNavigate()
  // Nếu chưa có auth context, user sẽ là null, isAuthenticated là false
  // Code vẫn chạy tốt, coi như là khách vãng lai
//   const { user, isAuthenticated } = useAuth() 
//   const { toast } = useToast()
  
  const [book, setBook] = useState(null)

  useEffect(() => {
    const bookData = getBookById(params.id)
    if (bookData) {
      setBook(bookData)
    }
  }, [params.id, toast])

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <p>Không tìm thấy sách</p>
        </div>
      </div>
    )
  }

//   const isMember = user?.role === "member"

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col">
        <div className="flex items-center gap-4 mb-6">
            <Link href={`/book/${book.id}`}>
            <Button variant="ghost" className="pl-0">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
            </Button>
            </Link>
            <div>
                <h1 className="text-2xl font-bold line-clamp-1">{book.title}</h1>
                <p className="text-sm text-muted-foreground">{book.author}</p>
            </div>
        </div>

        {/* Truyền các props cần thiết cho trình đọc PDF */}
        <div className="flex-1 bg-slate-50 rounded-lg border">
            <PDFViewer
                bookId={book.id}
                totalPages={book.totalPages || 512} // Mặc định 512 trang nếu thiếu data
                isFree={book.isFree}
                // isAuthenticated={isAuthenticated}
                // isMember={isMember}
                // hasPurchased={hasPurchased}
            />
        </div>
      </main>
    </div>
  )
}