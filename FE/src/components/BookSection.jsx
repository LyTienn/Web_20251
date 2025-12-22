import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Heart, BookOpen, Share2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import HeaderBar from "./HeaderBar";
import axios from "@/config/Axios-config";
import { useSelector } from "react-redux";
import { ReviewsSection } from "@/components/Review-section";
import ReviewDialog from "@/components/Review-dialog";

export default function BookSection({ book: bookProp }) {
  const params = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [book, setBook] = useState(bookProp || null);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!bookProp && params.id) {
      setLoading(true);
      axios.get(`/books/${params.id}`)
        .then(res => {
          setBook(res.data);
        })
        .catch(() => setBook(null))
        .finally(() => setLoading(false));
    }
  }, [params.id, bookProp]);

  if(!book) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Chọn một cuốn sách để xem chi tiết
      </div>
    );
  }

  const handleToggleFavorite = () => {
    if (!user || !isAuthenticated) {
      toast.error("Bạn cần đăng nhập để thêm sách vào yêu thích");
      navigate("/login");
      return;
    }

  const bookshelves = JSON.parse(localStorage.getItem("bookshelves") || "[]")

  if (isFavorite) {
    // Remove from favorites
    const updated = bookshelves.filter(
      (item) => !(item.userId === user.id && item.bookId === book?.id && item.category === "favorite"),
    )
    localStorage.setItem("bookshelves", JSON.stringify(updated))
    setIsFavorite(false)
    toast({
      title: "Đã xóa khỏi yêu thích",
    })
  } else {
    // Add to favorites
    bookshelves.push({
      userId: user.id,
      bookId: book?.id || "",
      category: "favorite",
      addedAt: new Date().toISOString(),
    })
    localStorage.setItem("bookshelves", JSON.stringify(bookshelves))
    setIsFavorite(true)
    toast({
      title: "Đã thêm vào yêu thích",
    })
    }
  }

  //HANDLE READBOOK SẼ SỬA LẠI KHI CÓ USER (ĐÃ ĐĂNG NHẬP THÌ CÓ THỂ ĐỌC + SÁCH HỘI VIÊN HAY FREE)
  const handleReadBook = () => {
    if(book?.id) {
      navigate(`/book/${book.id}/read`);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast.success("Đã sao chép liên kết vào clipboard");
    setShareDialogOpen(false)
  }

  const handleShareSocial = (platform) => {
    const url = encodeURIComponent(window.location.href)
    const title = encodeURIComponent(book?.title || "")
    let shareUrl = ""

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
        break
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${url}&text=${title}`
        break
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
      setShareDialogOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderBar />
      <main className="container mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:font-medium transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{book.title}</span>
        </nav>
      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        <div>
          <div className="relative aspect-2/3 rounded-lg overflow-hidden mb-4">
            <img src={book.imageUrl || book.image_url} alt={book?.title} className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="space-y-2">
            <Button className="w-full hover:bg-gray-100" size="lg" onClick={handleReadBook}>
              <BookOpen className="h-4 w-4 mr-2" />
              Đọc sách
            </Button>
          </div>
        </div>
        <div>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2 text-balance">{book.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">{book.author.name}</p>
              <div className="text-sm text-muted-foreground mb-4 relative">
                <span
                  className={
                    showFullSummary
                      ? ""
                      : "line-clamp-2"
                  }
                >
                  {book.summary}
                </span>
                {book.summary && book.summary.length > 120 && (
                  <button
                    className="ml-2 font-bold hover:underline bg-transparent border-none p-0 inline cursor-pointer"
                    style={{ fontSize: "inherit" }}
                    onClick={() => setShowFullSummary((prev) => !prev)}
                  >
                    {showFullSummary ? "Thu gọn" : "Xem thêm"}
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button className='hover:bg-gray-200' variant={isFavorite ? "default" : "outline"} size="icon" onClick={handleToggleFavorite}>
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
              </Button>
              <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogTrigger asChild>
                  <Button className='hover:bg-gray-200' variant="outline" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Chia sẻ sách</DialogTitle>
                    <DialogDescription>Chia sẻ "{book.title}" với bạn bè của bạn</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Button 
                      onClick={handleCopyLink}
                      variant="outline"
                      className='w-full justify-start bg-transparent hover:bg-gray-100'
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Sao chép liên kết
                    </Button>
                    <Button
                      onClick={() => handleShareSocial("facebook")}
                      variant="outline"
                      className="w-full justify-start hover:bg-gray-100"
                    >
                      <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Chia sẻ lên Facebook
                    </Button>
                    <Button
                      onClick={() => handleShareSocial("twitter")}
                      variant="outline"
                      className="w-full justify-start hover:bg-gray-100"
                    >
                      <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                      Chia sẻ lên Twitter
                    </Button>
                    <Button
                      onClick={() => handleShareSocial("telegram")}
                      variant="outline"
                      className="w-full justify-start hover:bg-gray-100
                      "
                    >
                      <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                      Chia sẻ lên Telegram
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              {book.type === 'FREE' ? (
                <Badge className="bg-green-400">Miễn phí</Badge>
              ) : (
                <Badge className='bg-gray-200' variant="secondary">Hội viên</Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-8">
        <div className="mb-6">
          {user ? (
              <ReviewDialog
                bookId={book.id}
                userId={user.id}
                userName={user.name}
                onReviewAdded={() => setReviewRefreshKey((prev) => prev + 1)}
              />
            ) : (
              <div className="text-center py-8 bg-muted rounded-lg">
                <p className="text-muted-foreground mb-4">Vui lòng đăng nhập để đánh giá sách</p>
                <Button onClick={() => router.push("/login")}>Đăng nhập</Button>
              </div>
            )}
        </div>
        <ReviewsSection bookId={book.id} refreshKey={reviewRefreshKey} />
      </div>
    </main>
    </div>
  );  
}

