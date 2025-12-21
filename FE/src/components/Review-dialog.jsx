import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { Star, StarHalf, MessageCircle } from "lucide-react";
import axios from "@/config/Axios-config";

const ReviewDialog = ({ bookId, onReviewAdded }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const handleSubmit = async () => {
        if (!isAuthenticated) {
            toast.error("Vui lòng đăng nhập để gửi đánh giá.");
            return;
        }

        if (rating === 0) {
            toast.error("Vui lòng chọn đánh giá sao.");
            return;
        }
        setSubmitting(true);
        try {
            await axios.post(`/comments/books/${bookId}/comments`, {
                rating: rating,
                content: comment,
            });
            toast.success("Đánh giá của bạn đã được gửi thành công!");
            setIsOpen(false);
            setRating(0);
            setComment("");
            if (onReviewAdded) {
                onReviewAdded();
            }
        } catch (err) {
            if (err.response && err.response.status === 409) {
                toast.error("Bạn đã đánh giá cuốn sách này trước đó.");
            } else {
                toast.error("Đã xảy ra lỗi khi gửi đánh giá. Vui lòng thử lại.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-50% gap-2 hover:bg-gray-100" size="lg">
                    <MessageCircle className="h-4 w-4" />
                    Viết đánh giá
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Đánh giá sách</DialogTitle>
                    <DialogDescription>
                        Chia sẻ suy nghĩ của bạn về cuốn sách này để giúp cộng đồng đọc sách tốt hơn.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2 flex flex-col items-center">
                        <span className="text-sm font-medium text-muted-foreground">Chọn mức độ hài lòng</span>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        className={`h-10 w-10 transition-colors duration-200 ${
                                            (hoverRating || rating) >= star
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-slate-200 fill-slate-100"
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="h-5 text-sm font-medium text-yellow-600">
                            { hoverRating === 1 && "Tệ" }
                            { hoverRating === 2 && "Trung bình" }
                            { hoverRating === 3 && "Bình thường" }
                            { hoverRating === 4 && "Tốt" }
                            { hoverRating === 5 && "Tuyệt vời" }
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nội dung bình luận</label>
                        <Textarea
                            placeholder="Sách hay ở điểm nào ? Có điều gì bạn muốn chia sẻ ? ..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>
                    
                    <Button 
                        onClick={handleSubmit} 
                        disabled={rating === 0 || submitting} 
                        className="w-full"
                    >
                        {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ReviewDialog;