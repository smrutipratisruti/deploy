import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with your key from .env.local
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeResumeWithAI(resumeText: string, jdText?: string) {
  // Using the stable Gemini 2.5 Flash model for 2026
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // 💡 Dynamic Instruction Logic: This separates Mode 1 from Mode 2
  const modePrompt = jdText 
    ? `MODE: JOB-SPECIFIC MATCHING.
       1. Compare the Resume against this specific Job Description: "${jdText}".
       2. Calculate a 'Match Percentage' (atsScore) based on how well this candidate fits THIS specific role.
       3. Identify 'missingSkills' specifically required by this JD but absent in the Resume.`
    : `MODE: GENERAL MARKET ANALYSIS.
       1. Analyze the Resume against global industry standards for Software Engineering.
       2. Calculate an 'atsScore' based on resume structure, keyword density, and quantifiable impact.
       3. Suggest 'missingSkills' that are currently high-demand in the general tech market for this candidate's level.`;

  const prompt = `
  You are an expert AI Career Coach and Technical Hiring Specialist.
  
  INPUTS:
  1. Resume Text: ${resumeText}
  2. Job Description (optional): ${jdText || "Not provided"}

  TASK:
  Analyze the resume. If a JD is provided, perform a "job_specific" analysis. 
  If no JD is provided, perform a "general" market-standard analysis.

  STRICT RULES:
  - Output MUST be valid JSON.
  - Be specific and honest. No generic fluff.
  - For 'improved_bullets', take actual weak lines from the resume and rewrite them with metrics.

  OUTPUT FORMAT:
  {
    "analysis_type": "${jdText ? 'job_specific' : 'general'}",
    "ats_score": {
      "score": number,
      "label": "Estimated ATS Compatibility Score",
      "confidence": "85%",
      "reasoning": "Detailed explanation of the score based on keywords and formatting"
    },
    "profile_summary": {
      "candidate_level": "Fresher/Junior/Mid-level",
      "primary_domain": "e.g., Frontend/Fullstack",
      "strength_summary": "Honest 2-line summary"
    },
    "top_skills": [],
    "missing_keywords": [],
    "gaps_analysis": [
      { "skill": "string", "importance": "High/Med", "reason": "string", "impact": "string" }
    ],
    "resume_issues": [
      { "issue": "string", "fix": "string" }
    ],
    "improved_bullets": [
      { "original": "string", "improved": "string" }
    ]
  }
`;

  try {
    console.log(jdText ? "--- Mode 2: Job Matching ---" : "--- Mode 1: General Analysis ---");
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean the response: Find the JSON block in case the AI adds backticks or text
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI failed to return a valid JSON structure.");
    
    const parsedData = JSON.parse(jsonMatch[0]);
    
    console.log("✅ Gemini Analysis Successful");
    return parsedData;

  } catch (error: any) {
    console.error("Gemini API Error:", error.message);
    
    // Fallback object so the UI remains functional even during an error
    return {
      atsScore: 0,
      matchType: "Error",
      topSkills: ["Error fetching skills"],
      missingSkills: ["Check API/Model status"],
      projectSuggestions: [],
      careerRoadmap: "Please try re-uploading your resume or check your connection."
    };
  }
}