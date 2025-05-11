import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025

const apiKey = process.env.ANTHROPIC_API_KEY || "sk-ant-placeholder";

export const anthropic = new Anthropic({
  apiKey,
});

export async function analyzeDocumentWithClaude(documentContent: string): Promise<any> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      system: "You are a document analysis expert. Extract structured information from documents including tables, headings, and important data points. Provide a comprehensive conclusion and summary of the document. Return your analysis as valid JSON.",
      max_tokens: 1500,
      messages: [
        { 
          role: 'user', 
          content: `Analyze this document and extract its key information. Format your response as JSON with the following structure:
          {
            "documentStructure": string,
            "estimatedWordCount": number,
            "tables": [],
            "headings": [],
            "summary": string,
            "conclusion": string,
            "keyPoints": [],
            "recommendedActions": []
          }
          
          Make sure to include a detailed conclusion that highlights the main findings, implications, and key takeaways of the document.\n\n${documentContent}`
        }
      ],
    });

    // Parse the Claude response to extract the JSON
    const content = response.content[0] as { type: 'text', text: string };
    
    // Extract JSON if it's wrapped with code blocks
    const jsonMatch = content.text.match(/```json\n([\s\S]*)\n```/) || content.text.match(/```\n([\s\S]*)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content.text;

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error analyzing document with Claude:", error);
    throw new Error(`Claude analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
