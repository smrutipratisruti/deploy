import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure this uses your env variable name correctly
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeResumeWithAI(resumeText: string) {
  // 💡 FIX: Updated to Gemini 2.5 (1.5 is retired in 2026)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
  You are an unbiased ATS (Applicant Tracking System) Engine. 
  Analyze the provided resume based on universal professional standards.
  
  EVALUATION CRITERIA:
  1. Formatting (Is it machine-readable? Is there a clear hierarchy?)
  2. Keyword Density (Does the candidate use industry-standard terminology?)
  3. Quantifiable Impact (Are there numbers, metrics, or specific achievements?)
  4. Section Completeness (Summary, Experience, Skills, Education).

  Resume Content: ${resumeText}

  Return ONLY a JSON object:
  {
    "atsScore": number (0-100),
    "topSkills": ["identified skills from the text"],
    "missingSkills": ["industry-standard skills missing for this specific candidate's career level"],
    "projectSuggestions": ["projects to strengthen their existing profile"],
    "careerRoadmap": "3 steps to improve this resume's professional appeal"
  }
`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Safety regex to extract JSON block
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI response was not in JSON format");
    
    const parsedData = JSON.parse(jsonMatch[0]);
    console.log("✅ Gemini 2.5 Analysis Successful");
    return parsedData;

  } catch (error: any) {
    console.error("Gemini Error:", error.message);
    // Fallback to avoid breaking the UI
    return {
      atsScore: 0,
      topSkills: ["Model updated to 2.5"],
      missingSkills: ["Check API version"],
      projectSuggestions: [],
      careerRoadmap: "Error: " + error.message
    };
  }
}