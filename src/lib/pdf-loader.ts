// @ts-ignore
import * as pdf from 'pdf-parse/lib/pdf-parse.js';

export async function extractTextFromPDF(dataBuffer: Buffer): Promise<string> {
  try {
    // Some environments nest the function under .default, others don't.
    // This check makes your parser "bulletproof".
    const pdfParser = (pdf as any).default || pdf;

    const data = await pdfParser(dataBuffer);
    
    if (!data || !data.text) {
      throw new Error("No text found in PDF");
    }

    return data.text;
  } catch (error: any) {
    console.error("PDF Parsing Error:", error.message);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}