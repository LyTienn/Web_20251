export const splitTextBySentence = (text, maxLength = 4000) => {
    if (!text || text.length <= maxLength) return [text];

    const chunks = [];
    let currentChunk = "";

    // Split by sentence endings (. ! ? \n)
    // The regex keeps the delimiter
    const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxLength) {
            // If current chunk is not empty, push it
            if (currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = "";
            }

            // If single sentence is too long, hard split it (fallback)
            if (sentence.length > maxLength) {
                let tempSentence = sentence;
                while (tempSentence.length > 0) {
                    chunks.push(tempSentence.substring(0, maxLength));
                    tempSentence = tempSentence.substring(maxLength);
                }
            } else {
                currentChunk = sentence;
            }
        } else {
            currentChunk += sentence;
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
};

export const splitTextByLimit = (text, maxLength = 30000) => {
    if (!text || text.length <= maxLength) return [text];

    const chunks = [];
    let i = 0;
    while (i < text.length) {
        chunks.push(text.substring(i, i + maxLength));
        i += maxLength;
    }
    return chunks;
};
