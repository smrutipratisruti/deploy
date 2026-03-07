'use client';
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a PDF file first.");
      return;
    }
    
    setLoading(true);
    setMessage("");
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage(`✅ Success! Resume ID: ${data.id}`);
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
            {loading ? "Parsing PDF..." : "Analyze Resume"}
          </button>

          {message && (
            <div className={`p-4 rounded-lg text-sm font-medium ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}