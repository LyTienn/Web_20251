import { GeminiEmbeddings } from "../utils/GeminiEmbeddings.js";
import GeminiClient from "../utils/GeminiClient.js";
import Book from "../models/book-model.js";

// Custom Simple Vector Store Implementation to avoid heavy dependencies
class SimpleVectorStore {
    constructor(embeddings) {
        this.embeddings = embeddings;
        this.documents = []; // { pageContent, metadata, vector }
    }

    async addVectors(vectors, documents) {
        for (let i = 0; i < vectors.length; i++) {
            this.documents.push({
                vector: vectors[i],
                pageContent: documents[i].pageContent,
                metadata: documents[i].metadata
            });
        }
    }

    async similaritySearch(query, k = 3) {
        const queryVector = await this.embeddings.embedQuery(query);

        // Calculate cosine similarity for all docs
        const scoredDocs = this.documents.map(doc => {
            const similarity = this.cosineSimilarity(queryVector, doc.vector);
            return { ...doc, score: similarity };
        });

        // Sort by score descending and take top k
        scoredDocs.sort((a, b) => b.score - a.score);
        return scoredDocs.slice(0, k);
    }

    cosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}

let vectorStore = null;

export const initializeVectorStore = async () => {
    try {
        console.log("Initializing RAG Vector Store...");

        // 1. Fetch books
        // Limit to 100 newest books for performance startup.
        const books = await Book.findAll({
            limit: 100,
            where: { is_deleted: 0 },
            attributes: ['id', 'title', 'summary', 'language', 'author_id', 'embedding', 'image_url'],
            order: [['id', 'DESC']]
        });

        if (books.length === 0) {
            console.warn("No books found to embed.");
            return;
        }

        const embeddings = new GeminiEmbeddings(process.env.GEMINI_API_KEY);
        const docsForVectorStore = [];
        const booksToUpdate = [];

        console.log(`RAG: Found ${books.length} books. Checking/Generating embeddings...`);

        // 2. Process books
        for (const book of books) {
            const content = `Title: ${book.title}\nLanguage: ${book.language}\nSummary: ${book.summary || "No summary available"}`;
            // Metadata now includes image_url and link for the RAG context
            const metadata = {
                id: book.id,
                title: book.title,
                image_url: book.image_url,
                link: `/book/${book.id}`
            };

            let vector;

            // Check embedding in DB
            if (book.embedding) {
                try {
                    vector = JSON.parse(book.embedding);
                } catch (e) {
                    console.warn(`Failed to parse embedding for book ${book.id}`);
                }
            }

            // Generate if missing
            if (!vector) {
                try {
                    // console.log(`Generating embedding for book ${book.id}...`);
                    vector = await embeddings.embedQuery(content);
                    book.embedding = JSON.stringify(vector);
                    booksToUpdate.push(book.save());
                } catch (err) {
                    console.error(`Error embedding book ${book.id}:`, err);
                    continue;
                }
            }

            docsForVectorStore.push({
                pageContent: content,
                metadata: metadata,
                vector: vector
            });
        }

        // Save new embeddings back to DB
        if (booksToUpdate.length > 0) {
            console.log(`Saving ${booksToUpdate.length} new embeddings to database...`);
            await Promise.all(booksToUpdate);
        }

        // 3. Load into Vector Store
        vectorStore = new SimpleVectorStore(embeddings);

        await vectorStore.addVectors(
            docsForVectorStore.map(d => d.vector),
            docsForVectorStore.map(d => ({ pageContent: d.pageContent, metadata: d.metadata }))
        );

        console.log(`RAG Vector Store Initialized with ${docsForVectorStore.length} documents.`);

    } catch (error) {
        console.error("Failed to initialize RAG Vector Store:", error);
    }
};

export const addBookToVectorStore = async (bookId) => {
    try {
        if (!vectorStore) {
            console.warn("Vector store not initialized yet. Skipping single book add.");
            return;
        }

        const book = await Book.findByPk(bookId, {
            attributes: ['id', 'title', 'summary', 'language', 'author_id', 'embedding', 'image_url']
        });

        if (!book) return;

        console.log(`Adding book ${bookId} to RAG Vector Store...`);

        const content = `Title: ${book.title}\nLanguage: ${book.language}\nSummary: ${book.summary || "No summary available"}`;
        const metadata = {
            id: book.id,
            title: book.title,
            image_url: book.image_url,
            link: `/book/${book.id}`
        };

        const embeddings = new GeminiEmbeddings(process.env.GEMINI_API_KEY);
        let vector;

        // Check embedding in DB (should be null usually if new, but safeguards)
        if (book.embedding) {
            try {
                vector = JSON.parse(book.embedding);
            } catch (e) {
                console.warn(`Failed to parse embedding for book ${book.id}`);
            }
        }

        if (!vector) {
            vector = await embeddings.embedQuery(content);
            book.embedding = JSON.stringify(vector);
            await book.save();
        }

        await vectorStore.addVectors([vector], [{ pageContent: content, metadata: metadata }]);
        console.log(`Book ${bookId} added to RAG successfully.`);

    } catch (error) {
        console.error(`Failed to add book ${bookId} to vector store:`, error);
    }
};

export const chatWithRAG = async (query) => {
    if (!vectorStore) {
        throw new Error("Vector store is not initialized yet. Please wait for server startup to complete.");
    }

    try {
        // 1. Retrieve Context
        const results = await vectorStore.similaritySearch(query, 3);

        // Enrich context with image and link from metadata
        const context = results.map(r => {
            return `${r.pageContent}\nImage: ${r.metadata.image_url || "N/A"}\nLink: ${r.metadata.link}`;
        }).join("\n---\n");

        console.log("DEBUG RAG QUERY:", query);
        console.log("DEBUG RAG CONTEXT:", context);

        if (!context) {
            return "I couldn't find any relevant books in the library matching your query.";
        }

        const client = new GeminiClient(process.env.GEMINI_API_KEY);

        // Define Prompt
        const prompt = `You are a helpful library assistant.
        
        LANGUAGE INSTRUCTION:
        - Detect the language of the 'Question' below.
        - If the question is in Vietnamese, answer in Vietnamese.
        - If the question is in English, answer in English.
        - If the answer is not in the context, say "I don't have information about that in my library" (translated into the detected language).

        IMPORTANT FORMATTING RULES:
        1. When recommending a book, ALWAYS display its cover image first if available. Use Markdown syntax: ![Book Cover](url)
        2. Make the book title a clickable link. YOU MUST USE THE EXACT LINK PROVIDED IN THE "Link" FIELD OF THE CONTEXT. DO NOT MAKE UP EXTERNAL LINKS.
           - Correct: [Title of Book](/book/123)
           - Incorrect: [Title of Book](https://goodreads.com/...)
        3. Do NOT use plain asterisks (*) for lists. Use neat bullet points or paragraphs.
        4. Keep descriptions concise.

        Answer the question based ONLY on the following context:

Context:
${context}

Question: ${query}
Answer:`;

        const responseText = await client.generateContent(prompt);
        return responseText;
    } catch (error) {
        console.error("RAG Chat Error:", error);
        throw error;
    }
};
