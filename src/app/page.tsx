'use client';
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [jd, setJd] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a PDF file first.");
      return;
    }
    
    setLoading(true);
    setMessage("");
    setAnalysis(null); 
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jd', jd); // ✅ CRITICAL: Sending the JD to the backend

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage(`✅ Success! Analysis Complete.`);
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
    <main className="flex min-h-screen flex-col items-center p-8 bg-zinc-50 font-sans">
      {/* --- Input Section --- */}
      <div className="w-full max-w-2xl bg-white p-10 rounded-3xl shadow-xl border border-zinc-200">
        <h1 className="text-4xl font-black mb-2 text-zinc-900 tracking-tight">Career Copilot <span className="text-blue-600">AI</span></h1>
        <p className="text-zinc-500 mb-8 font-medium">Your personal AI Mentor</p>
        
        <div className="space-y-6">
          <div className="p-6 border-2 border-dashed border-zinc-200 rounded-2xl hover:border-blue-400 transition-colors group">
            <input 
              type="file" 
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-zinc-900 file:text-white hover:file:bg-zinc-800 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">Target Job Description (Optional)</label>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the JD here to get a specific match analysis..."
              className="w-full h-32 p-4 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-all text-sm text-zinc-600 bg-zinc-50/50"
            />
          </div>
          
          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:bg-zinc-400 disabled:shadow-none"
          >
            {loading ? "Mentor is analyzing..." : "Perform Audit"}
          </button>

          {message && (
            <div className={`p-4 rounded-xl text-sm font-bold text-center ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}
        </div>
      </div>

      {/* --- Results Section (The Mentor Audit) --- */}
      {analysis && (
        <div className="w-full max-w-4xl mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
          
          {/* Header Card */}
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <span className="text-xs font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-3 py-1 rounded-full">{analysis.analysis_type} Audit</span>
              <h2 className="text-3xl font-black text-zinc-900 mt-2">{analysis.profile_summary?.primary_domain || "Software Engineer"}</h2>
              <p className="text-zinc-500 font-bold">{analysis.profile_summary?.candidate_level}</p>
            </div>
            <div className="bg-zinc-900 text-white p-6 rounded-2xl text-center min-w-[160px]">
              <div className="text-4xl font-black">{analysis.ats_score?.score}%</div>
              <div className="text-[10px] font-bold uppercase tracking-tighter opacity-60">Estimated ATS Score</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Score Reasoning */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-lg">
              <h3 className="font-black text-zinc-900 uppercase text-xs tracking-widest mb-4">Score Reasoning</h3>
              <p className="text-sm text-zinc-600 leading-relaxed italic">"{analysis.ats_score?.reasoning}"</p>
            </div>

            {/* Missing Keywords */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-lg">
              <h3 className="font-black text-zinc-900 uppercase text-xs tracking-widest mb-4">ATS Keyword Gaps</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.missing_keywords?.map((word: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">+ {word}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Gaps Analysis Table */}
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
              <h3 className="font-black text-zinc-900 uppercase text-xs tracking-widest">Market Gap Analysis</h3>
            </div>
            <div className="divide-y divide-zinc-100">
              {analysis.gaps_analysis?.map((gap: any, i: number) => (
                <div key={i} className="p-6 grid md:grid-cols-3 gap-4 items-center">
                  <div>
                    <span className="font-bold text-zinc-900 block">{gap.skill}</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${gap.importance === 'High' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                      {gap.importance} Priority
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 italic">{gap.reason}</p>
                  <p className="text-xs font-bold text-zinc-700">{gap.impact}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Resume Transformation */}
          <div className="bg-zinc-900 rounded-3xl p-8 text-white shadow-2xl">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
              <span className="bg-blue-600 p-2 rounded-lg text-xs">AI</span> 
              Resume Transformation
            </h3>
            <div className="space-y-8">
              {analysis.improved_bullets?.map((item: any, i: number) => (
                <div key={i} className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Your Current Version</span>
                    <p className="text-sm text-zinc-400 italic">"{item.original}"</p>
                  </div>
                  <div className="flex flex-col gap-2 bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700 border-l-4 border-l-green-500">
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Mentor Recommended Version</span>
                    <p className="text-sm text-green-50 font-medium leading-relaxed">{item.improved}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </main>
  );
}