import { getAllBooks } from "./controllers/book-controller.js";
import Book from "./models/book-model.js";
import Author from "./models/author-model.js";
import sequelize from "./config/db-config.js";
import BookShelf from "./models/bookshelf-model.js";

const testSearch = async () => {
    try {
        await sequelize.authenticate();
        console.log("DB Connected.");

        // 1. Get a sample book to know what to search for
        const sampleBook = await Book.findOne({
            include: [
                { model: Author, as: 'author' },
                { model: BookShelf, as: 'bookshelves' }
            ]
        });

        if (!sampleBook) {
            console.log("No books in DB to test.");
            return;
        }

        console.log(`Found sample book: "${sampleBook.title}" (is_deleted: ${sampleBook.is_deleted}) by "${sampleBook.author?.name}"`);
        const titleKeyword = sampleBook.title.substring(0, 3);
        const authorKeyword = sampleBook.author?.name ? sampleBook.author.name.substring(0, 3) : "NonExistent";

        // 2. Test mock Request/Response for Title Search
        console.log(`\n--- Testing Search by Title: "${titleKeyword}" ---`);
        const reqTitle = { query: { keyword: titleKeyword } };
        const resTitle = {
            status: function (code) { console.log("Status:", code); return this; },
            json: (data) => console.log("Response Data (Title):", JSON.stringify(data.data?.books?.length || data, null, 2) + " books found.")
        };
        await getAllBooks(reqTitle, resTitle);

        // 3. Test mock Request/Response for Author Search
        console.log(`\n--- Testing Search by Author: "${authorKeyword}" ---`);
        const reqAuthor = { query: { keyword: authorKeyword } };
        const resAuthor = {
            status: function (code) { console.log("Status:", code); return this; },
            json: (data) => console.log("Response Data (Author):", JSON.stringify(data.data?.books?.length || data, null, 2) + " books found.")
        };
        await getAllBooks(reqAuthor, resAuthor);

    } catch (error) {
        console.error("Test Error:", error);
    } finally {
        // await sequelize.close(); // Keep connection alive if needed or close
        process.exit();
    }
};

testSearch();
