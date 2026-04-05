import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '../../../lib/pdf-loader';
import { connectDB } from '../../../lib/mongodb';
import { analyzeResumeWithAI } from '../../../lib/gemini';
import Resume from '../../../models/Resume';

export const runtime = 'nodejs';

// ... existing imports ...

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const jd = formData.get('jd') as string;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Extract Text
    const extractedText = await extractTextFromPDF(buffer);
    console.log("✅ Text Extracted. Length:", extractedText.length);

    // 2. 💡 CALL THE AI (Make sure 'await' is here!)
    console.log("--- Calling Gemini AI ---");
    const aiAnalysis = await analyzeResumeWithAI(extractedText, jd);

    // 3. Save to MongoDB
    const newResume = await Resume.create({
  userId: "temp-user-123", // 💡 Add this line!
  fileName: file.name,
  content: extractedText,
  analysis: aiAnalysis,
});

    // 4. 💡 SEND THE DATA BACK TO FRONTEND
    // ... after saving to MongoDB ...

return NextResponse.json({ 
  success: true, 
  data: aiAnalysis // 💡 Ensure this key is called 'data' to match your page.tsx
});

  } catch (error: any) {
    console.error("Critical Backend Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}