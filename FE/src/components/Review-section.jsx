// import { useEffect, useState } from "react";
// import { Star } from "lucide-react";

// export function ReviewsSection({ bookId, refreshKey }) {
//   const [reviews, setReviews] = useState([]);
//   const [averageRating, setAverageRating] = useState(0);

//   useEffect(() => {
//     const bookReviews = getBookReviews(bookId);
//     setReviews(bookReviews);
//     setAverageRating(getAverageRating(bookId));
//   }, [bookId, refreshKey]);

//   if (reviews.length === 0) {
//     return (
//       <div className="text-center py-12 text-muted-foreground">
//         <p>Chưa có đánh giá nào cho cuốn sách này</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Average Rating Summary */}
//       <div className="bg-muted p-4 rounded-lg">
//         <div className="flex items-center gap-4">
//           <div className="text-center">
//             <div className="text-3xl font-bold">{averageRating}</div>
//             <div className="flex gap-1 mt-2 justify-center">
//               {[...Array(5)].map((_, i) => (
//                 <Star
//                   key={i}
//                   className={`h-4 w-4 ${
//                     i < Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
//                   }`}
//                 />
//               ))}
//             </div>
//             <div className="text-sm text-muted-foreground mt-2">({reviews.length} đánh giá)</div>
//           </div>
//         </div>
//       </div>

//       {/* Individual Reviews */}
//       <div className="space-y-4">
//         <h3 className="font-semibold text-lg">Các đánh giá từ người dùng</h3>
//         {reviews.map((review) => (
//           <div key={review.id} className="border rounded-lg p-4">
//             <div className="flex items-start justify-between mb-2">
//               <div>
//                 <p className="font-medium">{review.userName}</p>
//                 <div className="flex gap-1 mt-1">
//                   {[...Array(5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       className={`h-3 w-3 ${
//                         i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
//                       }`}
//                     />
//                   ))}
//                 </div>
//               </div>
//               <p className="text-sm text-muted-foreground">{new Date(review.createdAt).toLocaleDateString("vi-VN")}</p>
//             </div>
//             {review.comment && <p className="text-sm text-foreground mt-2">{review.comment}</p>}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }