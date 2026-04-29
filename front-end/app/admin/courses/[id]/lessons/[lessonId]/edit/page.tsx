"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, FileText, ArrowLeft, Save, Film, Type, BookOpen, Layers, Loader2 } from "lucide-react";

export default function EditLessonPage() {
  const { id, lessonId } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [order, setOrder] = useState(0);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [existingPdf, setExistingPdf] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    fetch(`http://localhost:8000/lessons/course/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const lessons = Array.isArray(data) ? data : data.data ?? [];
        const lesson = lessons.find((l: any) => l.id === Number(lessonId));
        if (!lesson) { toast.error("Lesson not found"); return; }
        setTitle(lesson.title || "");
        setContent(lesson.content || "");
        setVideoUrl(lesson.videoUrl || "");
        setOrder(lesson.order || 0);
        if (lesson.pdfUrl) setExistingPdf(lesson.pdfUrl);
      })
      .finally(() => setLoading(false));
  }, [id, lessonId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    try {
      setUpdating(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("videoUrl", videoUrl);
      formData.append("order", order.toString());
      if (pdfFile) formData.append("pdf", pdfFile);

      const res = await fetch(`http://localhost:8000/lessons/${lessonId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error();
      toast.success("Lesson updated successfully");
      router.push(`/admin/courses/${id}/lessons`);
    } catch { toast.error("Error updating lesson"); }
    finally { setUpdating(false); }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-gray-400 font-bold animate-pulse">Loading lesson details...</p>
    </div>
  );

  const pdfUrl = existingPdf ? `http://localhost:8000${existingPdf.startsWith("/") ? existingPdf : `/${existingPdf}`}` : null;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="p-3 bg-white hover:bg-gray-100 rounded-2xl shadow-sm border border-gray-100 transition-all active:scale-90"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase">Edit Lesson</h2>
            <p className="text-gray-500 text-xs md:text-sm font-medium italic">Adjust lesson content and materials</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* MAIN FORM CARD */}
        <div className="bg-white p-5 md:p-10 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Title - Full width on all screens */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em] ml-1">
                <Type size={14} className="text-blue-500" /> Lesson Title
              </label>
              <input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-gray-800" 
                required 
                placeholder="Enter lesson title..."
              />
            </div>

            {/* Video URL */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em] ml-1">
                <Film size={14} className="text-blue-500" /> Video URL (YouTube/Vimeo)
              </label>
              <input 
                value={videoUrl} 
                onChange={(e) => setVideoUrl(e.target.value)} 
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-gray-800" 
                placeholder="https://youtube.com/..." 
              />
            </div>

            {/* Order Sequence */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em] ml-1">
                <Layers size={14} className="text-blue-500" /> Order Sequence
              </label>
              <input 
                type="number" 
                value={order} 
                onChange={(e) => setOrder(Number(e.target.value))} 
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-gray-800" 
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em] ml-1">
              <BookOpen size={14} className="text-blue-500" /> Content Description
            </label>
            <textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 h-40 focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-gray-700 resize-none" 
              placeholder="Describe the lesson content..."
            />
          </div>

          {/* FILE UPLOAD SECTION */}
          <div className="pt-4">
            <label className="block text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em] ml-1">Lesson Materials (PDF)</label>
            <div className="relative border-2 border-dashed border-gray-200 rounded-[1.5rem] p-6 md:p-10 flex flex-col items-center justify-center gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors group">
              {pdfUrl && !pdfFile && (
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-blue-600">
                    <FileText size={32} />
                  </div>
                  <a href={pdfUrl} target="_blank" className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-2">
                    View Current Document
                  </a>
                </div>
              )}
              
              <div className="flex flex-col items-center gap-3">
                <label className="flex items-center gap-3 cursor-pointer bg-white border-2 border-blue-500 text-blue-600 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-md active:scale-95">
                  <Upload size={18} />
                  {pdfFile ? "Change PDF" : "Upload New PDF"}
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    hidden 
                    onChange={(e) => e.target.files && setPdfFile(e.target.files[0])} 
                  />
                </label>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  {pdfFile ? `Selected: ${pdfFile.name}` : "Only PDF files are supported"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={updating} 
            className="w-full bg-blue-600 text-white font-black uppercase tracking-[0.15em] py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
          >
            {updating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Updating Lesson...
              </>
            ) : (
              <>
                <Save size={20} />
                Update Lesson Details
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}