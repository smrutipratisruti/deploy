import { extractText } from 'unpdf';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const result = await extractText(uint8Array);
    
    let extractedText = "";

    // If result has a pages array, join them; otherwise, check the text property
    if ((result as any).pages && Array.isArray((result as any).pages)) {
      extractedText = (result as any).pages.map((p: any) => p.text).join("\n");
    } else {
      extractedText = (result as any)?.text || result;
    }

    // Clean up extra whitespace
    const finalOutput = typeof extractedText === 'string' ? extractedText.trim() : "";

    if (!finalOutput) {
      throw new Error("No readable text found in this PDF.");
    }

    console.log("✅ Text Extracted Successfully (Length:", finalOutput.length, ")");
    return finalOutput;
  } catch (error: any) {
    console.error("PDF Parsing Error:", error.message);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}