import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiEmbeddings {
    constructor(apiKey) {
        this.client = new GoogleGenerativeAI(apiKey);
        this.model = this.client.getGenerativeModel({ model: "text-embedding-004" });
    }

    async embedDocuments(documents) {
        return Promise.all(
            documents.map(doc =>
                this.embedQuery(doc.pageContent || doc)
            )
        );
    }

    async embedQuery(text) {
        // Basic clean up
        const cleanText = text.replace(/\n/g, " ");
        const result = await this.model.embedContent({ content: { parts: [{ text: cleanText }] } });
        return result.embedding.values;
    }
}
