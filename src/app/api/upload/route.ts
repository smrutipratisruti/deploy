import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '../../../lib/pdf-loader';
import connectDB from '../../../lib/mongodb';
import Resume from '../../../models/Resume';

// Force Node.js runtime (Important for pdf-parse)
export const runtime = 'nodejs';

// Use a NAMED EXPORT for the POST method
export async function POST(req: NextRequest) {
  try {
    console.log("--- Upload API Hit ---");
    await connectDB();
    
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const extractedText = await extractTextFromPDF(buffer);
    console.log("Text Extracted Successfully");

    const newResume = await Resume.create({
      userId: "temp-user-123", 
      fileName: file.name,
      content: extractedText,
    });

    return NextResponse.json({ 
      message: "✅ Resume processed successfully!", 
      id: newResume._id 
    });

  } catch (error: any) {
    console.error("Backend Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}