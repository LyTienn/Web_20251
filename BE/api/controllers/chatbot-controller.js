import { chatWithRAG } from "../services/rag-service.js";

export const chat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }

        const formattedMessage = message.trim();
        const response = await chatWithRAG(formattedMessage);

        res.status(200).json({ success: true, data: response });
    } catch (error) {
        console.error("Chatbot Controller Error:", error);
        res.status(500).json({ success: false, message: "Failed to process request" });
    }
};
