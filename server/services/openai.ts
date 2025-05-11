import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

const apiKey = process.env.OPENAI_API_KEY || "sk-placeholder";

export const openai = new OpenAI({ 
  apiKey
});

export async function analyzeDocumentWithGPT4(documentContent: string): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a document analysis expert. Analyze the provided document content and extract key information including table locations, titles, structured data, and provide a concise summary/conclusion of the document."
        },
        {
          role: "user",
          content: `Analyze this document and provide structured data about its content. Return your analysis as JSON with the following structure:
          {
            "tables": [], 
            "textBlocks": number, 
            "language": string,
            "summary": string,
            "conclusion": string,
            "keyFindings": []
          }
          
          Make sure to include a clear, concise conclusion that summarizes the main points and implications of the document.\n\n${documentContent}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error analyzing document with GPT-4:", error);
    throw new Error(`GPT-4 analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
