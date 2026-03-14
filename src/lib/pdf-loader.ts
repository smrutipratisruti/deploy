import { extractText } from 'unpdf';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const result = await extractText(uint8Array);
    
    let rawText = "";

    // 💡 Handle different return types from unpdf
    if (typeof result === 'string') {
      rawText = result;
    } else if (Array.isArray(result)) {
      // If it's an array of strings
      rawText = result.join(" ");
    } else if (result && typeof result === 'object') {
      // If it's the standard object format { text: "...", pages: [...] }
      const anyResult = result as any;
      rawText = anyResult.text || anyResult.pages?.map((p: any) => p.text).join(" ") || "";
    }

    // Now that we definitely have a string, we can safely trim it
    const cleanText = rawText.toString().trim();

    if (!cleanText || cleanText.length < 10) {
      throw new Error("PDF content is empty or unreadable.");
    }

    console.log("✅ Text Extracted. Length:", cleanText.length);
    return cleanText;

  } catch (error: any) {
    console.error("Extraction Error:", error.message);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}