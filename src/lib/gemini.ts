import { GoogleGenerativeAI } from "@google/generative-ai";

// 💡 This part initializes the AI using your API key from .env.local
const genAI = new GoogleGenerativeAI(process.env.AIzaSyBpWAbu_qAHBEaFB9_SoXsD0knzJoNQRQs!);

export async function analyzeResumeWithAI(resumeText: string) {
  // Now genAI is defined and can be used here!
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this resume for a 20 LPA Software Engineer role. 
    You MUST return ONLY a valid JSON object. Do not include any introductory text.
    
    Resume: ${resumeText}

    Return this exact JSON structure:
    {
      "atsScore": 85,
      "topSkills": ["React", "Node.js"],
      "missingSkills": ["System Design", "Redis"],
      "projectSuggestions": ["Scalable Chat App", "Microservices Project"],
      "careerRoadmap": "Your 3 step plan"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // 💡 This regex finds the JSON block even if Gemini adds "Here is the JSON..."
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not find JSON in AI response");
    
    const parsedData = JSON.parse(jsonMatch[0]);
    console.log("✅ Gemini Analysis Successful");
    return parsedData;

  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback so the database doesn't stay empty
    return {
      atsScore: 0,
      topSkills: ["Error parsing"],
      missingSkills: ["Check Gemini API"],
      projectSuggestions: [],
      careerRoadmap: "Please try re-uploading."
    };
  }
}