import dacnhantam from '../assets/dac-nhan-tam.webp';

export const genres = [
  { id: 1, name: 'Văn học' },
  { id: 2, name: 'Khoa học viễn tưởng' },
  { id: 3, name: 'Kinh dị' },
  { id: 4, name: 'Trinh thám' },
  { id: 5, name: 'Thiếu nhi' },
]

export const sampleCategories = [
    {
      categoryTitle: 'Sách Bán Chạy',
      books: [
        {
          id: 1,
          title: 'Nhà Giả Kim',
          author: 'Paulo Coelho',
          genreId: "1",
          imageUrl: 'https://via.placeholder.com/150x220.png?text=Nhà+Giả+Kim',
          description: 'Cuốn tiểu thuyết nổi tiếng về hành trình theo đuổi vận mệnh của chàng chăn cừu Santiago.',
          isFree: true,
          totalPages: 200
        },
        {
          id: 2,
          title: 'Đắc Nhân Tâm',
          author: 'Dale Carnegie',
          genreId: "2",
          imageUrl: dacnhantam,
          description: 'Nghệ thuật giao tiếp và ứng xử để đạt được thành công trong cuộc sống.',
          isFree: true,
          totalPages: 205
        },
        {
          id: 3,
          title: 'Muôn Kiếp Nhân Sinh',
          author: 'Nguyên Phong',
          genreId: "3",
          imageUrl: 'https://via.placeholder.com/150x220.png?text=Muôn+Kiếp',
          description: 'Hành trình luân hồi và những bài học sâu sắc về luật nhân quả.',
          isFree: true,
          totalPages: 125
        },
        {
          id: 4,
          title: 'Cây Cam Ngọt Của Tôi',
          author: 'J. M. de Vasconcelos',
          genreId: "4",
          imageUrl: 'https://via.placeholder.com/150x220.png?text=Cây+Cam',
          description: 'Câu chuyện cảm động về tuổi thơ của một cậu bé thông minh và tinh nghịch.',
          isFree: false,
          totalPages: 243
        },
      ]
    },
    {
        categoryTitle: 'Văn Học Việt Nam',
        books: [
          {
            id: 5,
            title: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh',
            author: 'Nguyễn Nhật Ánh',
            genreId: "1",
            imageUrl: 'https://via.placeholder.com/150x220.png?text=Hoa+Vàng',
            description: 'Câu chuyện tuổi thơ trong sáng, hồn nhiên ở một làng quê Việt Nam.',
            isFree: false,
            totalPages: 432
          },
          {
            id: 6,
            title: 'Số Đỏ',
            author: 'Vũ Trọng Phụng',
            genreId: "1",
            imageUrl: 'https://via.placeholder.com/150x220.png?text=Số+Đỏ',
            description: 'Tác phẩm châm biếm kinh điển về xã hội thành thị Việt Nam thời Pháp thuộc.',
            isFree: true,
            totalPages: 310
          },
          {
            id: 7,
            title: 'Dế Mèn Phiêu Lưu Ký',
            author: 'Tô Hoài',
            genreId: "1",
            imageUrl: 'https://via.placeholder.com/150x220.png?text=Dế+Mèn',
            description: 'Cuộc phiêu lưu của chú Dế Mèn qua thế giới loài vật đầy màu sắc.',
            isFree: false,
            totalPages: 152
          },
        ]
      }
];

export function getBookById(id) {
  const allBooks = sampleCategories.flatMap(category => category.books);
  return allBooks.find(book => book.id == id);
}