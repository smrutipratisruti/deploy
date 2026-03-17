'use client';
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  // 💡 New state to hold the AI results
  const [analysis, setAnalysis] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a PDF file first.");
      return;
    }
    
    setLoading(true);
    setMessage("");
    setAnalysis(null); // Clear previous results
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage(`✅ Success! Analysis Complete.`);
        // 💡 Catch the data returned from route.ts
        setAnalysis(data.data); 
      } else {
        setMessage(`❌ Error: ${data.error || "Upload failed"}`);
      }
    } catch (err) {
      setMessage("❌ Network error. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-zinc-50">
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-zinc-200">
        <h1 className="text-3xl font-extrabold mb-2 text-zinc-900">AI Career Copilot</h1>
        <p className="text-zinc-500 mb-8">Upload your resume to start the AI analysis.</p>
        
        <div className="space-y-6">
          <div className="group relative">
            <input 
              type="file" 
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>
          
          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full bg-zinc-900 text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all disabled:bg-zinc-300 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? "Analyzing with AI..." : "Analyze Resume"}
          </button>

          {message && (
            <div className={`p-4 rounded-lg text-sm font-medium ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}
        </div>
      </div>

      {/* 💡 The Results Display (Only shows after success) */}
      {analysis && (
        <div className="w-full max-w-2xl mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-zinc-200 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-xl font-bold text-zinc-900">Analysis Results</h2>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                ATS Score: {analysis.atsScore || "N/A"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Top Skills Identified</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.topSkills?.map((skill: string, i: number) => (
                    <span key={i} className="bg-zinc-100 text-zinc-800 px-3 py-1 rounded-md text-sm border border-zinc-200">{skill}</span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-2">Gaps for 20 LPA</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills?.map((skill: string, i: number) => (
                    <span key={i} className="bg-red-50 text-red-700 px-3 py-1 rounded-md text-sm border border-red-100">{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Recommended Projects</h3>
              <ul className="space-y-2">
                {analysis.projectSuggestions?.map((proj: string, i: number) => (
                  <li key={i} className="text-zinc-700 text-sm flex items-start">
                    <span className="mr-2 text-blue-500">▹</span> {proj}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}