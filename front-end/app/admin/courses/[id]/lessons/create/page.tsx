"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, ArrowLeft, PlusCircle, Type, Film, Layers, BookOpen, Loader2 } from "lucide-react";

export default function AddLessonPage() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [order, setOrder] = useState(0);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) { toast.error("You are not authenticated"); return; }

    try {
      setCreating(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("videoUrl", videoUrl);
      formData.append("order", order.toString());
      formData.append("courseId", id as string);
      if (pdfFile) formData.append("pdf", pdfFile);

      const res = await fetch("http://localhost:8000/lessons", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error();
      toast.success("Lesson created successfully");
      setTimeout(() => router.push(`/admin/courses/${id}/lessons`), 1000);
    } catch {
      toast.error("Error creating lesson");
    } finally {
      setCreating(false);
    }
  };

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
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase">Create Lesson</h2>
            <p className="text-gray-500 text-xs md:text-sm font-medium italic">Add a new learning module to your course</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* MAIN FORM CARD */}
        <div className="bg-white p-5 md:p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Lesson Title */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em] ml-1">
                <Type size={14} className="text-green-500" /> Lesson Title
              </label>
              <input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 focus:bg-white focus:border-green-500 outline-none transition-all font-bold text-gray-800 placeholder:text-gray-300" 
                required 
                placeholder="e.g. Introduction to React Hooks"
              />
            </div>

            {/* Video URL */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em] ml-1">
                <Film size={14} className="text-green-500" /> Video Link
              </label>
              <input 
                value={videoUrl} 
                onChange={(e) => setVideoUrl(e.target.value)} 
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 focus:bg-white focus:border-green-500 outline-none transition-all font-bold text-gray-800 placeholder:text-gray-300" 
                placeholder="https://youtube.com/watch?v=..." 
              />
            </div>

            {/* Order Sequence */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em] ml-1">
                <Layers size={14} className="text-green-500" /> Lesson Order
              </label>
              <input 
                type="number" 
                value={order} 
                onChange={(e) => setOrder(Number(e.target.value))} 
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 focus:bg-white focus:border-green-500 outline-none transition-all font-bold text-gray-800" 
              />
            </div>
          </div>

          {/* Content Description */}
          <div>
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em] ml-1">
              <BookOpen size={14} className="text-green-500" /> Description
            </label>
            <textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 h-40 focus:bg-white focus:border-green-500 outline-none transition-all font-medium text-gray-700 resize-none placeholder:text-gray-300" 
              placeholder="What will students learn in this lesson?"
            />
          </div>

          {/* FILE UPLOAD SECTION */}
          <div className="pt-2">
            <label className="block text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em] ml-1">Attachment (PDF)</label>
            <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 bg-slate-50/50 hover:bg-slate-50 transition-all group">
              <div className={`p-4 rounded-2xl transition-all ${pdfFile ? 'bg-green-100 text-green-600' : 'bg-white text-gray-400 shadow-sm'}`}>
                <Upload size={32} strokeWidth={2.5} />
              </div>
              
              <div className="text-center">
                <label className="inline-flex items-center gap-2 cursor-pointer bg-green-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100 active:scale-95">
                  Choose PDF File
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    hidden 
                    onChange={(e) => e.target.files && setPdfFile(e.target.files[0])} 
                  />
                </label>
                <p className="mt-3 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                  {pdfFile ? `Selected: ${pdfFile.name}` : "Maximum file size: 10MB"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={creating} 
            className="w-full bg-green-600 text-white font-black uppercase tracking-[0.2em] py-5 rounded-[1.5rem] hover:bg-green-700 transition-all shadow-xl shadow-green-200 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
          >
            {creating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <PlusCircle size={20} />
                Publish Lesson
              </>
            )}
          </button>
        </div>
      </form>

      {/* FOOTER HINT */}
      <div className="mt-8 text-center">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">EduRio Course Architect</p>
      </div>
    </div>
  );
}