// Use the legacy build for Node.js
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = new Uint8Array(buffer);
    
    // We cast the object to 'any' to stop the red line on disableWorker
    const loadingTask = pdfjs.getDocument({
      data,
      disableWorker: true, 
      verbosity: 0 
    } as any);
    
    const pdf = await loadingTask.promise;
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => (item as any).str)
        .join(" ");
        
      fullText += pageText + "\n";
    }

    return fullText;
  } catch (error: any) {
    console.error("PDF Parsing Error:", error.message);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}