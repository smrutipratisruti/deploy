export async function analyzeResumeWithAI(resumeText: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this resume for a 20 LPA Software Engineer role. 
    Return ONLY a JSON object. No extra text.
    
    Resume: ${resumeText}

    Format:
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
    const response = result.response.text();
    
    // 💡 This line is the "Senior Dev" secret: It finds the JSON even if Gemini adds chatty text
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in AI response");
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Return a fallback object so the DB isn't empty
    return { atsScore: 0, topSkills: [], missingSkills: ["Error analyzing"], projectSuggestions: [], careerRoadmap: "Try again" };
  }
}